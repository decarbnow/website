import LazyLayerSet from './LazyLayerSet.js';

import baseTiles from './baseTiles.js';
import overlayTiles from './overlayTiles.js';
import pollutions from './pollutions.js';
import points from './points.js';
import tweets from './tweets.js';
import countries from './countries.js';

let layerSets = {
    baseTiles: new LazyLayerSet('baseTiles', baseTiles),
    overlayTiles: new LazyLayerSet('overlayTiles', overlayTiles),
    pollutions: new LazyLayerSet('pollutions', pollutions),
    points: new LazyLayerSet('points', points),
    countries: new LazyLayerSet('countries', countries),
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
