import path from 'node:path';

import { globSync } from 'glob';
import { parse } from '.';
import { getHelp, getVersion, parseArgs } from './args';
import { initConfig, loadConfig, locateDefaultConfigPath } from './conf';

export function execute() {
  const argsConfig = parseArgs();

  if (argsConfig.help) {
    console.log(getHelp());
    return;
  }

  if (argsConfig.version) {
    console.log(getVersion());
    return;
  }

  if (argsConfig.init) {
    initConfig(process.cwd());
    return;
  }

  // TODO: Allow specifying of config path from command line args
  const programConfigPath = locateDefaultConfigPath(process.cwd());
  const programConfig = loadConfig(programConfigPath);

  // app.log.debug(programConfig);

  const programRoot = path.resolve(process.cwd(), programConfig.srcDir);
  const inputFiles = globSync(programConfig.files.include, {
    cwd: programRoot,
    ignore: programConfig.files.exclude,
  }).map(file => path.resolve(programRoot, file));

  // app.log.debug(inputFiles);

  parse(inputFiles, { cwd: process.cwd(), config: programConfig, args: argsConfig });
}
