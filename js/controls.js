define(['jquery', 'leaflet', 'leaflet.editable', 'leaflet.toolbar'], function ($, L) {


    var controls = {
        toolbarInstance: null,
        getInstance: function () {
            if (typeof(toolbarInstance) === 'object') {
                return instance;
            } else {
                throw 'Toolbar is not initialized, call toolbarService.init prior this method';
            }
        },
        drawingMode: {
            POLYGON: 'Polygon',
            LINESTRING: 'LineString',
            POINT: 'Point'
        }
    };

    // define barra de ferramentas do mapa e suas ações
    controls.init = function (mapInstance, featureGroup) {
        var tooltip = L.DomUtil.get('tooltip');
        function addTooltip (e) {
            tooltip.innerHTML = 'Clique no mapa para inserir o local de trabalho';
            tooltip.style.display = 'block';
        }

        function removeTooltip (e) {
            tooltip.innerHTML = '';
            tooltip.style.display = 'none';
        }

        mapInstance.on('editable:drawing:start', addTooltip);
        mapInstance.on('editable:drawing:end', removeTooltip);

        var geoSearchControl = new GeoSearch.GeoSearchControl({
            provider: new GeoSearch.GoogleProvider({ params: { key: 'AIzaSyCnynEiBhiItwzvp2Ly-p7mL7up2mHl8nA' } }),
            style: 'bar',
            showMarker: false,
            searchLabel: 'Digite o endereço, cep ou coordenada',
            notFoundMessage: 'Desculpe, não encontramos o endereço'
        });

        mapInstance.addControl(geoSearchControl);
    };

    return controls;
});
