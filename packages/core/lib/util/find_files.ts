import fs from 'fs';
import os from 'os';
import path from 'path';
import klawSync from 'klaw-sync';

import FileError from '../errors/file_error';

class FindFiles {
  path: string;
  includeFilters: string | string[];
  excludeFilters: string | string[];

  constructor() {
    this.path = process.cwd();
    this.includeFilters = [];
    this.excludeFilters = [];
  }

  setPath(newPath: string) {
    if (path) {
      this.path = path.resolve(newPath);
    }
  }

  setIncludeFilters(includeFilters: string | string[]) {
    this.includeFilters = includeFilters;
  }

  setExcludeFilters(excludeFilters: string | string[]) {
    this.includeFilters = excludeFilters;
  }

  search(): string[] {
    let files: string[] = [];

    try {
      files = klawSync(this.path).map(entry => entry.path);

      // Include Filters
      let includeFilters = this.includeFilters;
      if (typeof includeFilters === 'string') {
        includeFilters = [includeFilters];
      }

      const includeFiltersPatterns: RegExp[] = [];
      for (const filter of includeFilters) {
        if (filter.length > 0) {
          includeFiltersPatterns.push(new RegExp(filter));
        }
      }

      files = files.filter(filename => {
        let _filename = filename;

        if (fs.statSync(_filename).isDirectory()) {
          return 0;
        }

        if (os.platform() === 'win32') {
          _filename = _filename.replace(/\\/g, '/');
        }

        for (const filter of includeFiltersPatterns) {
          if (filter.test(filename)) {
            return 1;
          }
        }

        return 0;
      });

      // Exclude filters
      let excludeFilters = this.excludeFilters;
      if (typeof excludeFilters === 'string') {
        excludeFilters = [excludeFilters];
      }

      const excludeFiltersPatterns: RegExp[] = [];
      for (const filter of excludeFilters) {
        if (filter.length > 0) {
          excludeFiltersPatterns.push(new RegExp(filter));
        }
      }

      files = files.filter(filename => {
        let _filename = filename;

        if (fs.statSync(_filename).isDirectory()) {
          return 0;
        }

        if (os.platform() === 'win32') {
          _filename = _filename.replace(/\\/g, '/');
        }

        for (const filter of excludeFiltersPatterns) {
          if (filter.test(filename)) {
            return 0;
          }
        }

        return 1;
      });
    } finally {
      if (!files || files.length === 0) {
        // biome-ignore lint/correctness/noUnsafeFinally: This check must happen regardless of whether an error was thrown
        throw new FileError('No files found.', '', this.path);
      }

      files = files.map(filename => {
        if (filename.startsWith(this.path)) {
          return filename.substring(this.path.length + 1);
        }
        return filename;
      });
    }

    return files;
  }
}

const findFiles = new FindFiles();

export default findFiles;
