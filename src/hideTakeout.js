import { FEATURES } from './features.js';
import { FEATURE_CLASS } from './constants.js';
import { htmlClassToggler } from './utils.js';

export const apply = htmlClassToggler(FEATURES.hideTakeout, FEATURE_CLASS.hideTakeout);
