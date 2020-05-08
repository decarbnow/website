import $ from 'jquery';
window.$ = $

import base from "./map/base.js";
import url from './map/url.js';

window.base = base

base.init()
url.stateFromUrl();

//import "./geoip.js";
