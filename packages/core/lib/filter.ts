// import _ from 'lodash';

// import { App } from '.';

// let app: App;

// export default class Filter extends Object {
//   filters: Record<string, unknown> = {};

//   constructor(_app: App) {
//     super();
//     app = _app;

//     const filters = Object.keys(app.filters);
//     for (const filter of filters) {
//       if (_.isObject(app.filters[filter])) {
//         app.log.debug(`inject filter: ${filter}`);
//         this.addFilter(filter, app.filters[filter]);
//       } else {
//         const filename = app.filters[filter];
//         app.log.debug(`load filter: ${filter}, ${filename}`);
//         this.addFilter(filter, require(filename));
//       }
//     }
//   }

//   addFilter(name: string, filter: unknown) {
//     this.filters[name] = filter;
//   }

//   // process(parsedFiles: unknown[], parsedFilenames: string[]) {}
// }
