import 'zone.js/node';

import { APP_BASE_HREF } from '@angular/common';
import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { existsSync } from 'fs';
import { join } from 'path';
import { get } from 'env-var';
import { AppServerModule } from './src/main.server';
import * as qs from 'qs';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';
  const axios = require('axios');
  let parseString = require('xml2js').parseString;


  const ANGULR_API_GET_URLS = '/api/getURLs';

  const ANGULR_API_GET_PLANS = '/api/getPlans';
  const API_GET_PLANS = get('API_GET_PLANS').asString();

  const ANGULR_API_GET_STATS ='/api/getStats';
  const API_GET_STATS = get('API_GET_STATS').asString();

  const session = require('express-session');

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/main/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
    inlineCriticalCss: false,
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  server.get(ANGULR_API_GET_URLS,  (req, res) => {
    res.send({plans:API_GET_PLANS, stats: API_GET_STATS});
  });

  server.get(ANGULR_API_GET_PLANS,  (req, res) => {
    var myTimestamp = new Date().getTime().toString();
    axios.get(API_GET_PLANS,)
      .then(response => {
        console.debug("ANGULR_API_GET_PLANS", response.data)
        let jsonResult = {};
        parseString(response.data, function (err, result) {
          jsonResult  = result;
        });
        console.debug("ANGULR_API_GET_PLANS: jsonResult", jsonResult)

        res.send(jsonResult);
      })
      .catch(error => {
        console.log("ANGULR_API_GET_PLANS", error);
      });
  });

  server.get(ANGULR_API_GET_STATS,  (req, res) => {

    var myTimestamp = new Date().getTime().toString();
    axios.get(API_GET_STATS,)
      .then(response => {
        console.debug("ANGULR_API_GET_STATS", response.data)
        res.send(response.data);
      })
      .catch(error => {
        console.log("ANGULR_API_GET_STATS", error);
      });
  });




  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';
