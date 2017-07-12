import { combineReducers } from 'redux';
import places from './places';
import report from './report';
import layerGroupSettings from './layerGroupSettings';
import heatmapSettings from './heatmapSettings';

const app = combineReducers({
    places,
    report,
    layerGroupSettings,
    heatmapSettings
});

export default app;

