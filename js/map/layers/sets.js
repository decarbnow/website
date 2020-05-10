import LazyLayerSet from './LazyLayerSet.js';

import tiles from './tiles.js';
import pollutions from './pollutions.js';
import points from './points.js';

export default {
    tiles: new LazyLayerSet('tiles', tiles),
    pollutions: new LazyLayerSet('pollutions', pollutions),
    points: new LazyLayerSet('points', points)
};
