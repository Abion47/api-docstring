import fs from 'fs';
import path from 'path';
import iconv from 'iconv-lite';
import _ from 'lodash';

import { App } from '.';
// import ParameterError from './errors/parameter_error';
// import ParserError from './errors/parser_error';
import type { Language } from './languages/_types';
import { FieldParser, FieldParserOutput } from './parsers/_types';

let app: App;
// let filterTag: string | null = null;

export default class Parser extends Object {
  languages: Record<string, Language>;
  parsers: {
    global: Record<string, FieldParser>;
    rest: Record<string, FieldParser>;
    event: Record<string, FieldParser>;
  };
  parsedFileElements: unknown[];
  parsedFiles: unknown[];
  countDeprecated: Record<string, unknown>;

  constructor(_app: App) {
    super();

    app = _app;

    this.languages = {};
    this.parsers = {
      global: {},
      rest: {},
      event: {},
    };
    this.parsedFileElements = [];
    this.parsedFiles = [];
    this.countDeprecated = {};

    const languages = Object.entries(app.options.languages);
    for (const [key, language] of languages) {
      if (_.isObject(language)) {
        app.log.debug('inject parser language:', language);
        this.addLanguage(key, language);
      } else {
        const filename = language;
        app.log.debug('load parser language:', key, ',', filename);
        this.addLanguage(key, require(filename));
      }
    }

    const registerParsers = (target: 'global' | 'rest' | 'event', parserOpts: Record<string, string>) => {
      const parsers = Object.entries(parserOpts);
      for (const [key, parser] of parsers) {
        if (_.isObject(parser)) {
          app.log.debug('inject parser:', parser);
          this.addParser(target, key, parser);
        } else {
          const filename = parser;
          app.log.debug('load parser:', key, ',', filename);
          this.addParser(target, key, require(filename));
        }
      }
    };

    if (app.options.parsers.global) {
      registerParsers('global', app.options.parsers.global);
    }
    if (app.options.parsers.rest) {
      registerParsers('rest', app.options.parsers.rest);
    }
    if (app.options.parsers.event) {
      registerParsers('event', app.options.parsers.event);
    }
  }

  addLanguage(key: string, language: Language) {
    this.languages[key] = language;
  }

  addParser(type: 'global' | 'rest' | 'event', key: string, parser: FieldParser) {
    this.parsers[type][key] = parser;
  }

  parseFiles(options: ParserOptions) {
    const parsedFiles: Record<string, Block[]> = {};

    for (const file of app.files) {
      const filename = path.basename(file);
      const parsedFileBlocks = this.parseFile(file, options.encoding);

      if (parsedFileBlocks) {
        app.log.verbose(`parse file: ${filename}`);
        parsedFiles[file] = parsedFileBlocks;
      }
    }

    return parsedFiles;
  }

  parseFile(filename: string, _encoding: string) {
    let encoding = _encoding;
    if (encoding === 'undefined') {
      encoding = 'utf8';
    }

    app.log.debug(`inspect file: ${filename}`);

    const parserState: ParserState = {
      filename,
      extension: path.extname(filename).toLowerCase(),
      src: '',
      blocks: [],
      indexApiBlocks: [],
    };

    const fileContents = fs.readFileSync(filename);

    return this.parseSource(fileContents, encoding, parserState);
  }

  parseSource(fileContents: Buffer, encoding: string, state: ParserState) {
    state.src = iconv.decode(fileContents, encoding);
    app.log.debug(`size: ${state.src.length}`);

    state.src = state.src.replace(/\r\n/g, '\n');

    state.blocks = this.findBlocks(state);
    if (state.blocks.length === 0) return;

    app.log.debug(`count blocks: ${state.blocks.length}`);

    let elementCount = 0;
    for (let i = 0; i < state.blocks.length; i++) {
      const block = state.blocks[i];
      block.elements = this.findElements(block, state);
      app.log.debug(`count elements in block ${i}: ${block.elements.length}`);
      elementCount += block.elements.length;
    }
    if (elementCount === 0) return;

    for (const block of state.blocks) {
      this.inferProtoTypeOfBlock(block);
    }

    this.parseBlockElements(state);

    return state.blocks;
  }

  private findBlocks(state: ParserState) {
    const blocks: Block[] = [];
    const src = state.src;

    const regexForFile = this.languages[state.extension] || this.languages.default;
    let matches = regexForFile.docBlocksRegExp.exec(src);

    while (matches) {
      let block = matches[2] || matches[1];

      block = block.replace(regexForFile.inlineRegExp, '');
      blocks.push({
        source: block,
        lines: block.split('\n'),
        elements: [],
        hasError: false,
      });

      // Find next
      matches = regexForFile.docBlocksRegExp.exec(src);
    }

    return blocks;
  }

  private findElements(block: Block, _: ParserState) {
    const elements: Element[] = [];
    const elementDeclareRegExp = /^\s*(@(\w*)\s?(.*?))$/gm;

    let currentElement: Partial<Element> = {};
    let currentElementIdx = 0;
    let bodyLines: string[] = [];

    const finalizeElement = () => {
      if (!currentElement.name) return;
      if (bodyLines.length > 0) {
        const body = this.parseBodyLines(bodyLines);
        if (body) currentElement.body = body;
        bodyLines = [];
      }
      elements.push(currentElement as Element);
    };

    for (const line of block.lines) {
      elementDeclareRegExp.lastIndex = 0;
      const matches = elementDeclareRegExp.exec(line);
      if (matches) {
        finalizeElement();
        currentElement = {
          index: currentElementIdx++,
          source: matches[1],
          name: matches[2].toLowerCase(),
          sourceName: matches[2],
          content: matches[3],
        };
      } else {
        bodyLines.push(line);
      }
    }

    finalizeElement();

    return elements;
  }

  private parseBodyLines(lines: string[]): string | undefined {
    if (lines.length === 0) return undefined;

    let joined = lines.map(line => line.trim()).join('\n');

    joined = joined.replace(/\n\n/g, '\uffff');
    joined = joined.replace(/\n/g, ' ');
    joined = joined.replace(/\uffff/g, '\n');
    joined = joined.trim();

    return joined;
  }

  private inferProtoTypeOfBlock(block: Block) {
    const typedBlock = block as TypedBlock;

    for (const element of block.elements) {
      if (element.name === 'apiproto') {
        console.log(element);
        const type = element.content.split(' ')[0].replace(/[{}]/g, '');
        if (type === 'rest' || type === 'event') {
          typedBlock.type = type;
        } else {
          block.hasError = true;
          block.error = `Block of unsupported proto type: ${type}`;
          app.log.error(`Error parsing block: ${block.error}`);
        }
        return;
      }
    }

    if (typedBlock.type == null) {
      block.hasError = true;
      block.error = 'Block does not specify a proto type';
      app.log.error(`Error parsing block: ${block.error}`);
    }
  }

  private parseBlockElements(state: ParserState) {
    for (const block of state.blocks) {
      if (block.hasError) continue;

      const typedBlock = block as TypedBlock;
      for (const element of typedBlock.elements) {
        if (element.hasError) continue;

        let parser = this.parsers.global[element.name];
        if (!parser) {
          parser = this.parsers[typedBlock.type][element.name];
        }

        if (!parser) {
          block.hasError = true;
          block.error = 'Element error';
          element.error = `Parser cannot be found for element ${typedBlock.type}.${element.name}`;
          element.hasError = true;
          app.log.error(`Error parsing element contents: ${element.error}`);
          break;
        }

        const output = parser.parse(element);
        console.log(output);
        const parsed = element as ParsedElement;
        parsed.parserOutput = output;
        console.log(parsed);
      }

      console.dir(block, { depth: 99 });
    }
  }
}

export type Block = {
  source: string;
  lines: string[];
  elements: Element[];
  hasError: boolean;
  error?: string;
};
export type TypedBlock = Block & {
  type: 'rest' | 'event' | 'global';
};

export type Element = {
  index: number;
  source: string;
  name: string;
  sourceName: string;
  content: string;
  body?: string;
  hasError: boolean;
  error?: string;
};
export type ParsedElement = Element & {
  parserOutput: FieldParserOutput;
};

type ParserState = {
  filename: string;
  extension: string;
  src: string;
  blocks: Block[];
  indexApiBlocks: number[];
};

export type ParserOptions = {
  encoding: string;
};
