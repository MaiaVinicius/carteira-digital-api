const NodeCache = require( "node-cache" );
const myCache = new NodeCache( { stdTTL: 100, checkperiod: 120 } );

const wait = async (interval) => {
  await new Promise(resolve => setTimeout(resolve, interval));
}

const cacheGet = (key) => {
  return myCache.get(key);
}

const cacheSet = (key, value, expires = 60 * 24 * 1000) => {
  return myCache.set(key, value, expires);
}

module.exports = {
  wait: wait,
  cacheGet: cacheGet,
  cacheSet: cacheSet
};