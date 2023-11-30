// import _ from 'lodash';

// import {
//   App,
//   // PackageInfos
// } from '.';

// let app: App;

// export default class WorkerRecord extends Object {
//   workers: Record<string, unknown>;

//   constructor(_app: App) {
//     super();

//     app = _app;
//     this.workers = {};

//     const workers = Object.keys(app.workers);
//     for (const key of workers) {
//       const filename = app.workers[key];
//       app.log.debug(`load worker: ${key}, ${filename}`);
//       this.addWorker(key, require(filename));
//     }
//   }

//   addWorker(name: string, worker: unknown) {
//     this.workers[name] = worker;
//   }

//   // process(parsedFiles: string[], parsedFilenames: string[], packageInfos: PackageInfos[]) {}
// }
