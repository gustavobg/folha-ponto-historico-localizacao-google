define(['leaflet'], function (L) {
    L.Path.include({
        getType: function () {
            return this.toGeoJSON().geometry.type;
        }
    });
});
