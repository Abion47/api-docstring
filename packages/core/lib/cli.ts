// import { parse } from '.';
// import fs from 'fs';
import path from 'path';
import { loadConfig, locateDefaultConfigPath } from './conf';
import { globSync } from 'glob';
import { parse } from '.';

export function execute(_: string[]) {
  // console.log(process.cwd());
  // console.log(args);

  // TODO: Allow specifying of config path from command line args
  const programConfigPath = locateDefaultConfigPath(process.cwd());
  const programConfig = loadConfig(programConfigPath);

  // console.log(programConfig);

  const programRoot = path.resolve(process.cwd(), programConfig.srcDir);
  const inputFiles = globSync(programConfig.files.include, {
    cwd: programRoot,
    ignore: programConfig.files.exclude,
  }).map(file => path.resolve(programRoot, file));

  // console.log(inputFiles);

  parse(inputFiles, { cwd: process.cwd(), config: programConfig });
}
