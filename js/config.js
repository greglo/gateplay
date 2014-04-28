// http://requirejs.org/docs/api.html#config
require.config({
    baseUrl: 'js',

    paths: {
        jquery: 'http://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min',
        'jquery-ui': 'lib/jquery-ui',
        underscore: 'lib/underscore-min',
        foundation: 'lib/foundation.min',
        modernizr: "lib/custom.modernizr",
        backbone: 'lib/backbone-min',
        fabric: "lib/fabric.scope",
        priorityqueue: "lib/priorityqueue",
    },

    shim: {
        'underscore': {
            exports: '_'
        },
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'jquery': {
            exports: ['$', 'jQuery']
        },
        'jquery-ui' : {
            deps : ['jquery']
        },
        'foundation' : {
            deps : ['jquery', 'modernizr']
        },
    }
});