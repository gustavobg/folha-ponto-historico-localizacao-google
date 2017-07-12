import 'leaflet.gridlayer.googlemutant';
import 'tileGoogleDarkStyle';

const MapTiles = (mapInstance) => {

    const _createGoogleMutantTiles = (googleMutantTiles) => {

        return googleMutantTiles.map((tile) => {
            let tileInstance = L.gridLayer.googleMutant(tile);
            if (tile.selected) {
                tileInstance.addTo(mapInstance);
            } else {
                return tile['title'] = L.gridLayer.googleMutant(tile);
            }
        });
    };

    const initTiles = () => {

        const googleMutantTiles = [
            {
                title: 'Mapa',
                maxZoom: 24,
                type: 'roadmap'
            },
            {
                title: 'Aéreo',
                maxZoom: 24,
                type: 'satellite'
            },
            {
                title: 'Terreno',
                maxZoom: 24,
                type: 'terrain'
            },
            {
                title: 'Híbrido',
                maxZoom: 24,
                type: 'hybrid'
            },
            {
                title: 'Estilizado',
                maxZoom: 24,
                type: 'roadmap',
                styles: darkStyle,
                selected: true
            }];

        let tiles = _createGoogleMutantTiles(googleMutantTiles);

        return L.control.layers(tiles, {}, {
            collapsed: true
        }).addTo(mapInstance);
    };

    return {
        initTiles
    };
};

export default MapTiles;
