/*
 * @namespace spa.js
 * @author: waterbear
 */

/*jslint
    browser: true, continue: true, devel: true, indent: 4,
    maxerr: 50,    newcap: true,   nomen: true, plusplus: true,
    regexp: true,  sloppy: true,   vars: false, white: true
 */

/*global $, spa */

var spa = (function() {
    var initModule = function($container) {
        spa.data.initModule();
        spa.model.initModule();
        spa.shell.initModule($container);
    }
    return {
        initModule: initModule
    };
}());
