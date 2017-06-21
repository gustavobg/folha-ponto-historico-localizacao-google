define(['leaflet', 'js/gmaps-style-dark', 'tiles.google'], function (L, styleDark) {

    var tiles = {};
    var tilesInstance = null;

    tiles.init = function (mapInstance) {
        var roadMutant = L.gridLayer.googleMutant({
            maxZoom: 24,
            type: 'roadmap'
        });

        var satMutant = L.gridLayer.googleMutant({
            maxZoom: 24,
            type: 'satellite'
        });

        var terrainMutant = L.gridLayer.googleMutant({
            maxZoom: 24,
            type: 'terrain'
        });

        var hybridMutant = L.gridLayer.googleMutant({
            maxZoom: 24,
            type: 'hybrid'
        });


        var styleMutant = L.gridLayer.googleMutant({
            styles: styleDark,
            maxZoom: 24,
            type: 'roadmap'
        }).addTo(mapInstance);;

        tilesInstance = L.control.layers({
            'Mapa': roadMutant,
            'Híbrido': hybridMutant,
            'Aéreo': satMutant,
            'Terreno': terrainMutant,
            'Estilizado': styleMutant
        }, {}, {
            collapsed: true
        }).addTo(mapInstance);

        return tilesInstance;

    };

    var getInstance = function () {
        return tilesInstance;
    };

    tiles.getInstance = getInstance;

    return tiles;

});


