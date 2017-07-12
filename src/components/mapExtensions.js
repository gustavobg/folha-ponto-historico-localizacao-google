import L from 'leaflet';

L.Path.include({
    getType: () => {
        return this.toGeoJSON().geometry.type;
    }
});
L.GeoJSON.include({
    addDataLayer: (geojson) => {
        // same as addData, but returns layer recently added
        let layers = this.addData(geojson);
        layers = layers.getLayers();
        let layerLength = layers.length;
        return layers[layerLength - 1];
    }
});
