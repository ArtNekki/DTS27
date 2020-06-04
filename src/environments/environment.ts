// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import {Environment} from './interface';

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: 'AIzaSyB_EmPe421eZr0tqvDkYm07lVJuut7CsI0',
    authDomain: 'dts-rent.firebaseapp.com',
    databaseURL: 'https://dts-rent.firebaseio.com',
    projectId: 'dts-rent',
    storageBucket: 'dts-rent.appspot.com',
    messagingSenderId: '668591746217',
    appId: '1:668591746217:web:981d9cca4f932ce1f10db8',
    measurementId: 'G-Q2SSH8GBHN'
  }
}

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
