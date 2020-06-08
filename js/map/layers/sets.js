import LazyLayerSet from './LazyLayerSet.js';

import tiles from './tiles.js';
import pollutions from './pollutions.js';
import points from './points.js';
import tweets from './tweets.js';

let layerSets = {
    tiles: new LazyLayerSet('tiles', tiles),
    pollutions: new LazyLayerSet('pollutions', pollutions),
    points: new LazyLayerSet('points', points),
    tweets: new LazyLayerSet('tweets', tweets)
};

let layers = {};
Object.keys(layerSets).forEach((k) => {
    layers = {...layers, ...layerSets[k].layers};
});

export {
    layerSets,
    layers
}
