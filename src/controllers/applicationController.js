export default {

    async index(req, res, next){
        req.views = await req.redis.asyncIncr("index_views");
        res.json({greetings: 'index GET', views: req.views, uri: req.hostname, url: req.url})
    },

    async about(req, res, next){
        res.json({greetings: 'about GET'})
    },
}