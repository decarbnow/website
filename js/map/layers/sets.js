import LazyLayerSet from './LazyLayerSet.js';

import tiles from './tiles.js';
import pollutions from './pollutions.js';
import points from './points.js';

let sets = {
    tiles: new LazyLayerSet('tiles', tiles),
    pollutions: new LazyLayerSet('pollutions', pollutions),
    points: new LazyLayerSet('points', points),
};

let layers = {};
Object.keys(sets).forEach((k) => {
    layers = {...layers, ...sets[k].layers};
});

export {
    sets,
    layers
}
