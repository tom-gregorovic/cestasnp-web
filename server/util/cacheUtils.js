const memoryCache = require('memory-cache');

/**
 * Cache response for duration seconds.
 */
const cache = (duration) => (req, res, next) => {
  const key = "express_" + req.originalUrl || req.url;
  const cached = memoryCache.get(key);
  
  if (cached) {
    res.send(cached);
  } else {
    res.sendResponse = res.send;

    res.send = (body) => {
      memoryCache.put(key, body, duration * 1000);
      res.sendResponse(body);
    }

    next();
  }
};

module.exports = { cache };