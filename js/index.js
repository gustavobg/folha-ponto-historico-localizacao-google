define(['jquery', 'current.position', 'tiles', 'controls', 'turf', 'prettysize', 'leaflet-heatmap', 'bootstrap'], function ($, CurrentPosition, tiles, controls, turf) {
    var map;

    var layerBuffer = new L.geoJson(null, {});

    var heatOptions = {
        tileOpacity: 1,
        heatOpacity: 1,
        radius: 25,
        blur: 15
    };

    var vmMap = {
        workplace: ko.observable('<strong>Clique para inserir seu local de trabalho</strong>'),
        workplaceGeoJson: null
    };

    var workplaceHtml = '<strong>Local de trabalho: </strong><p class="info">{lat}, {lng}</p>';

    var addWorkplace = function (layer) {
        var latLng = layer.getLatLng();
        var html = L.Util.template(workplaceHtml, latLng);
        var workplaceBufferedGeoJson = turf.buffer(layer.toGeoJSON(), 50, 'meters');
        layerBuffer.addData(workplaceBufferedGeoJson);
        vmMap.workplace(html);
        vmMap.workplaceGeoJson = workplaceBufferedGeoJson;
    };

    var removeLocation = function (e, popup) {
        e.preventDefault();
        featureGroup.clearLayers();
        layerBuffer.clearLayers();
        vmMap.workplace('<strong>Clique para inserir seu local de trabalho</strong>');
        vmMap.workplaceGeoJson = null;
        localStorage.removeItem('workplace');
    };
    var onEachFeature = function (feature, layer) {

        bindLayerEvents(layer);
        addWorkplace(layer);
    };

    var heat = null;

    var bindLayerEvents = function (layer) {

        var removeLocationButton = $('<a href="#" id="remove-location" class="btn btn-danger">Remover local de trabalho</a>');
        layer.disableEdit();
        layer.bindPopup(removeLocationButton.get(0), {})
            .addEventListener('popupopen', function (e) {
                removeLocationButton.on('click', function (event) { removeLocation(event, e.popup) });
            })
            .addEventListener('popupclose', function () {
                removeLocationButton.off('click');
            });
    };

    var featureGroup = new L.geoJson(null, {
        onEachFeature: onEachFeature
    });


    var zoomToWorkplace = function () {
        var point = turf.centroid(vmMap.workplaceGeoJson);
        var lat = point.geometry.coordinates[1];
        var lng = point.geometry.coordinates[0];
        map.setView([lat, lng], 17);
    };

    var cancelEdit = function () {
        var editTools = map.editTools;
        if (!editTools._drawingEditor) return;
        var feature = editTools._drawingEditor.feature;
        feature.disableEdit();
        feature.remove();
    };

    var setupKeyboardEvents = function () {
        L.DomEvent.on(window, 'keyup', function (e) {
            if (e.keyCode === 27) {
                cancelEdit();
            }
        });
        L.DomEvent.on(window, 'keydown', function (e) {

            // eventos de teclado do editor
            // remove segmentos CTRL-Z, ou DELETE
            if (e.keyCode === 27) {
                e.stopPropagation();
                cancelEdit();
            } else {
                if (e.srcElement.nodeName !== 'INPUT' && e.srcElement.nodeName !== 'TEXTAREA') {
                    L.DomEvent.stopPropagation(e);
                    map.keyboard._onKeyDown(e);
                }
            }
        });

        L.DomEvent.on(map.getContainer(), 'mousemove', function (e) {
            if (map.editTools.drawing()) {
                L.DomEvent.stopPropagation(e);
                var el = $(this);
                var offset = el.offset();
                // Then refer to
                var x = e.pageX - offset.left;
                var y = e.pageY - offset.top;
                var width = el.width();
                var height = el.height();

                // todo, fazer diagonais
                //if (y < 35 && x > 35 && x < (width - 35)) {
                if (y < 35) {
                    map.panBy([0, -80]); // top
                } else if (x < 35) {
                    map.panBy([-80, 0]); // left
                } else if (y > (height - 35)) {
                    map.panBy([0, 80]); // bottom
                } else if (x > (width - 35)) {
                    map.panBy([80, 0]); // right
                }
            }
        });
    };

    // Start at the beginning
    initialize();

    function initialize () {

        // Initialize the map
        map = L.map( 'map', { editable: true, editOptions: { featuresLayer: featureGroup } } ).setView([0,0], 2);
        featureGroup.addTo(map);
        layerBuffer.addTo(map);

        document.getElementById('btnRelatorio').classList.add('disabled');

        heat = L.heatLayer([], heatOptions).addTo(map);

        controls.init(map, featureGroup);

        var layerControl = tiles.init(map);
        layerControl.addOverlay(heat, 'Mapa de Calor');

        map.on('editable:drawing:start', function (e) {
            featureGroup.clearLayers();
            layerBuffer.clearLayers();
        });
        map.on('editable:drawing:commit', function (e) {
            if (window.localStorage) {
                var geoJson = e.layer.toGeoJSON();
                localStorage.setItem('workplace', JSON.stringify(geoJson));
                addWorkplace(e.layer);
            } else {
                throw 'Your browser don\'t support localStorage';
            }
            bindLayerEvents(e.layer);
        });

        ko.applyBindings(vmMap, document.getElementById('container-aside'));

        // bind place
        if (window.localStorage) {
            var geoJson = localStorage.getItem('workplace');
            if (geoJson !== null) {
                geoJson = JSON.parse(geoJson);
                featureGroup.addData(geoJson);
            }
        } else {
            throw 'Your browser don\'t support localStorage';
        }

        // get current location
        var locationOptions = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };

        function success(pos) {
            var crd = pos.coords;
            var latLng = L.latLng(crd.latitude, crd.longitude);
            map.setView(latLng, 8);
        }

        function error(err) {
        }

        if (vmMap.workplaceGeoJson) {
            zoomToWorkplace();
        } else {
            navigator.geolocation.getCurrentPosition(success, error, locationOptions);
        }

        // criar barra de trabalho para delimitar seu trabalho

        // eventos:
        $('#btnPlace').on('click', function () {
            if (vmMap.workplaceGeoJson) {
                zoomToWorkplace();
            } else {
                map.editTools.startMarker(null, {});
            }
        });

        $('#file').change( function () {
            upload( this.files[0] );
            $(this).val('');
        });

        setupKeyboardEvents();
    }

    var getLocationDataFromKml = function (data, currentPosition) {
        var KML_DATA_REGEXP = /<when>(.*?)<\/when>\s*<gx:coord>(\S*)\s(\S*)\s(\S*)<\/gx:coord>/g,
            locations = [],
            match = KML_DATA_REGEXP.exec( data );

        // match
        //  [1] ISO 8601 timestamp
        //  [2] longitude
        //  [3] latitude
        while ( match !== null ) {
            var latitude = Number(match[3]);
            var longitude = Number(match[2]);
            var date = match[1];
            var timestamp = new Date(date);
            timestamp = timestamp.getTime();
            var r = currentPosition.updatePosition(latitude, longitude, 0, timestamp);
            locations.push(r.latLng);
            match = KML_DATA_REGEXP.exec( data );
        }

        return locations;
    };

    var latLongParser = function($coord) {
        var SCALAR_E7 = 0.0000001;
        var $value;
        $value = parseFloat($coord);
        $value = $value * SCALAR_E7;
        return $value;
    };


    var getLocationDataFromJson = function (data, currentPosition) {

        var locations = JSON.parse(data).locations;

        if ( !locations || locations.length === 0 ) {
            throw new ReferenceError( 'No location data found.' );
        }

        var result = locations.map( function ( location ) {
            var r = currentPosition.updatePosition(latLongParser(location.latitudeE7), latLongParser(location.longitudeE7), location.accuracy, location.timestampMs);
            return r.latLng;
        } );

        return result;
    };

    var exportToCsv = function () {
        var data = [["name1", "city1", "some other info"], ["name2", "city2", "more info"]];
        var csvContent = "data:text/csv;charset=utf-8,";
        data.forEach(function(infoArray, index){

            dataString = infoArray.join(",");
            csvContent += index < data.length ? dataString+ "\n" : dataString;

        });

        var encodedUri = encodeURI(csvContent);
        window.open(encodedUri);

        // var encodedUri = encodeURI(csvContent);
        // var link = document.createElement("a");
        // link.setAttribute("href", encodedUri);
        // link.setAttribute("download", "my_data.csv");
        // document.body.appendChild(link); // Required for FF
        //
        // link.click(); // This will download the data file named "my_data.csv".
    };

    var createReport = function (currentPosition) {

        var reportDays = (currentPosition.getWorkDays());
        var reportLength = reportDays.length;
        var i;

        var reportHtml = '';
        var periods = null;
        var period = null;
        var day = null;
        var currentMonthYear = null;

        for (i = reportLength - 1; i >= 0;) {
            day = reportDays[i];
            periods = day.periods;

            if (day.monthYear !== currentMonthYear) {
                reportHtml += '<tr class="month-year">';
                reportHtml += '<td colspan="9">';
                reportHtml += '<h3>' + day.monthYear + '</h3>';
                reportHtml += '</td>';
                reportHtml += '</tr>';
            }
            currentMonthYear = day.monthYear;

            reportHtml += '<tr data-date="' + day.date + '">';
            reportHtml += '<td style="display: none">';
            reportHtml += '<span class="day"><strong>' + day.date + '</strong></span>';
            reportHtml += '</td>';

            for (var p = periods.length - 1; p >= 0;) { // for (var p = periods.length - 1; p >= 0;) {
                period = periods[p];
                reportHtml += '<td><span>' + period.start + '</span></td><td class="end"><span>' + period.end + '</span></td>';
                p = p - 1;
            }
            for (var x = 0; x < 4 - periods.length;) {
                reportHtml += '<td><span class="empty"></span></td><td><span class="empty"></span></td>';
                x = x + 1;
            }
            reportHtml += '</tr>';
            i = i - 1;
        }

        document.getElementById('report').innerHTML = reportHtml;

    };

    var setStatus = function ( message ) {
        $( '#currentStatus' ).text( message );
    };

    var processFile = function (file) {

        var fileSize = prettySize( file.size ),
            reader = new FileReader();

        setStatus( 'Preparando para importar o arquivo (' + fileSize + ')...' );

        var currentPosition = new CurrentPosition(layerBuffer);
        currentPosition.setWorkplace(vmMap.workplaceGeoJson);


        reader.onprogress = function ( e ) {
            var percentLoaded = Math.round( ( e.loaded / e.total ) * 100 );
            setStatus( percentLoaded + '% de ' + fileSize + ' carregados...' );
        };

        reader.onload = function ( e ) {
            var latlngs;

            setStatus( 'Gerando mapa...' );

            try {
                if ( /\.kml$/i.test( file.name ) ) {
                    latlngs = getLocationDataFromKml( e.target.result, currentPosition );
                } else {
                    latlngs = getLocationDataFromJson( e.target.result, currentPosition );
                }
            } catch ( ex ) {
                setStatus( 'Opa! Deu algum problema pra gerar o relatório. Verifique se está realmente subindo os arquivos diretamente do histórico do Google Location, em formato (json ou kml), (erro: ' + ex.message + ')');
                return;
            }

            createReport(currentPosition);

            heat._latlngs = latlngs;
            heat.redraw();

            document.getElementById('btnRelatorio').classList.remove('disabled');

            showReport( latlngs.length );
        };

        reader.onerror = function () {
            setStatus( 'Opa! Deu algum problema pra gerar o relatório. Verifique se está realmente subindo os arquivos diretamente do histórico do Google Location, em formato (json ou kml), se persistir, cria uma "issue" no github.');
        };

        reader.readAsText( file );
    };


    var upload = function (file) {

        $('body').addClass('loading');
        $('#modal-resultado').modal('show');

        // Now start working!
        processFile(file);

    };

    var showReport = function (numberProcessed) {

        $( 'body' ).removeClass('loading');

        // Update count
        $( '#numberProcessed' ).text( numberProcessed.toLocaleString() );
    }
});





