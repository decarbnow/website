import LazyLayerSet from './LazyLayerSet.js';

import tiles from './tiles.js';
import pollutions from './pollutions.js';
import points from './points.js';

let layerSets = {
    tiles: new LazyLayerSet('tiles', tiles),
    pollutions: new LazyLayerSet('pollutions', pollutions),
    points: new LazyLayerSet('points', points),
};

let layers = {};
Object.keys(layerSets).forEach((k) => {
    layers = {...layers, ...layerSets[k].layers};
});

export {
    layerSets,
    layers
}
