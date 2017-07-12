import 'leaflet-toolbar';
import GeoSearch from 'leaflet-geosearch';

const MapControls = (mapInstance) => {

    let addTooltip = (tooltip) => {
        tooltip.innerHTML = 'Clique no mapa para inserir o local de trabalho';
        tooltip.style.display = 'block';
    };

    let removeTooltip = (tooltip) => {
        tooltip.innerHTML = '';
        tooltip.style.display = 'none';
    };

    const initControls = () => {
        let tooltip = L.DomUtil.get('tooltip');

        mapInstance.on('editable:drawing:start', () => addTooltip(tooltip));
        mapInstance.on('editable:drawing:end', () => removeTooltip(tooltip));

        let geoSearchControl = new GeoSearch.GeoSearchControl({
            provider: new GeoSearch.GoogleProvider({ params: { key: 'AIzaSyCnynEiBhiItwzvp2Ly-p7mL7up2mHl8nA' } }),
            style: 'bar',
            showMarker: false,
            searchLabel: 'Digite o endereço, cep ou coordenada',
            notFoundMessage: 'Desculpe, não encontramos o endereço'
        });

        mapInstance.addControl(geoSearchControl);
    };

    return {
        initControls
    }
};

export default MapControls;