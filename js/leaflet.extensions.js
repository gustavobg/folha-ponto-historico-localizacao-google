define([], function () {
    L.Path.include({
        getType: function () {
            return this.toGeoJSON().geometry.type;
        }
    });
    L.GeoJSON.include({
        addDataLayer: function (geojson) {
            // same as addData, but returns layer recently added
            var layers = this.addData(geojson);
            layers = layers.getLayers();
            var layerLength = layers.length;
            return layers[layerLength - 1];
        }
    });
});
