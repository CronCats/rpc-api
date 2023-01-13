// TODO: Remove the following once we can load from DB
import { activeDapps, dappSettings } from '../dapps/sputnik'

export const cache = new Map();

export function set(k, v) {
  cache.set(k, v);
}

export function get(k) {
  return cache.get(k);
}

export function getKeys() {
  return Array.from(cache.keys());
}

export function getValues() {
  return Array.from(cache.values());
}

export function initCache() {
  // initial set
  set('activeDapps', activeDapps)
  set('dappSettings', dappSettings)
}

export default get;
