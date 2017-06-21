var modulesPath = 'node_modules/';
var libsPath = 'libs/';
var scriptsPath = 'js/';

requirejs.config({
    baseUrl: '',
    paths: {
        'index': scriptsPath + 'index',
        'moment': modulesPath + 'moment/min/moment-with-locales',
        'moment-timezone': modulesPath + 'moment-timezone/builds/moment-timezone-with-data',
        'turf': modulesPath + 'turf/turf',
        'leaflet': modulesPath + 'leaflet/dist/leaflet',
        'toastr': 'https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min',
        'jquery': modulesPath + 'jquery/dist/jquery.min',
        'bootstrap': 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min',
        'current.position': scriptsPath + 'current.position',
        'prettysize': libsPath + 'prettysize',
        'leaflet-heatmap': libsPath + 'leaflet.heat.min',
        'tiles.google': scriptsPath + 'leaflet.google',
        'tiles': scriptsPath + 'tiles',
        'controls': scriptsPath + 'controls',
        //'leaflet.drag': libsPath + 'leaflet.drag/Path.Drag',
        'leaflet.editable': libsPath + 'leaflet.editable/leaflet.Editable',
        'leaflet.extensions': scriptsPath + 'leaflet.extensions',
        'leaflet.toolbar': libsPath + 'leaflet.toolbar/dist/leaflet.toolbar-src',
        //'geosearch': modulesPath + 'leaflet-geosearch/dist/bundle'
    },
    shim : {
        'bootstrap': { deps: ['jquery'] },
        'leaflet-heatmap': ['leaflet'],
        'tiles.google': { deps: ['leaflet'] },
        'leaflet.editable': { deps: ['leaflet'] },
        // 'geosearch/google': { deps: ['leaflet', 'geosearch'] },
        // 'geosearch/osm': { deps: ['leaflet', 'geosearch'] },
        //'geosearch': { deps: ['leaflet'] },
        'leaflet.toolbar': { deps: ['leaflet'] }
        //'leaflet.drag': { deps: ['leaflet'] }
    }
});

requirejs(['index']);