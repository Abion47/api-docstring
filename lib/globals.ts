import { App, type AppOptions } from './app';
import type { Config } from './conf';
import Parser from './parser';

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export default class Globals {
  static app: App;
  static parser: Parser;

  static initialize(appOpts: { files: string[]; cwd: string; programConfig: Config; options: AppOptions }) {
    Globals.app = new App(appOpts.files, appOpts.cwd, appOpts.programConfig, appOpts.options);
    Globals.parser = new Parser();
  }
}
