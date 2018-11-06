import util from 'util';

export const promisifyRedis = (req, res, next) => {
    req.redis.asyncGet = util.promisify(req.redis.get).bind(req.redis);
    req.redis.asyncSet = util.promisify(req.redis.set).bind(req.redis);
    req.redis.asyncIncr = util.promisify(req.redis.incr).bind(req.redis);
    next()
}