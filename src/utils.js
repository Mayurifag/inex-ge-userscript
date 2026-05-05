import { get } from './features.js';

export function htmlClassToggler(feature, className) {
  return () => document.documentElement.classList.toggle(className, get(feature.key));
}
