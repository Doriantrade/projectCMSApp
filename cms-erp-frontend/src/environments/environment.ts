// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // deploy_url: 'https://cmsbackerp.cashmachserv.com/api/',
  // hub: 'https://cmsbackerp.cashmachserv.com/',
  // apiHelpDeskSytemh: 'https://cmsbackticket.cashmachserv.com/',
  // apiCMSfile: 'https://cmsbackfiles.cashmachserv.com/',
  // image_url: 'https://cmsbackerp.cashmachserv.com/icon-cliente/',
  
  deploy_url: 'http://localhost:5130/api/',
  hub: 'http://localhost:5130/',
  apiHelpDeskSytemh: 'http://localhost:5075/',
  apiCMSfile: 'http://localhost:5130/',
  image_url: 'http://localhost:5130/icon-cliente/'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
