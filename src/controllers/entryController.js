import Entry from '../models/Entry';
import Blog from '../models/Blog';
import User from '../models/User';

export default {
    async create(req, res, next){
        const blog = req.blog;
        const { title, content } = req.body;
        if(!blog.checkPermission(req.user)) return next({status: 403, message: "You have no permission for add entry on this blog"});
        try{
            const entry = await Entry.create({title, content});
            blog.entries.push(entry);
            await blog.save();
            let path = `${req.protocol}://${req.hostname}${req.originalUrl}/${blog.slug}/${entry.slug}`;
            res.json({url: path, data: blog});
        }
        catch(err){
            next(err);
        }

    },
    async findOne(req, res, next){
        const { entry_slug } = req.params;
        let blog_entries = await Blog.aggregate(
            [ 
                { $match: { slug: req.blog.slug }},
                { $unwind: { path: "$entries" }},
                { $project: { entries: 1, _id: 0}}
            ])
        blog_entries = blog_entries.map(e => e.entries);
        const entry = await Entry.find({slug: entry_slug, _id: { $in: blog_entries } });
        if(entry.length == 0) return next({status: 404, message: "Entry does not exists"});
        req.views = await req.redis.asyncIncr(`${entry[0].title}:views`);
        res.json({data: {...entry[0]._doc, views: req.views}});
    },

    async delete(req, res, next){

    },

    async update(req, res, next){
        const { entry_slug } = req.params;
        const body = req.body;
        let blog_entries = await Blog.aggregate(
            [ 
                { $match: { slug: req.blog.slug }},
                { $unwind: { path: "$entries" }},
                { $project: { entries: 1, _id: 0}}
            ])
        blog_entries = blog_entries.map(e => e.entries);
        let entry = await Entry.find({slug: entry_slug, _id: { $in: blog_entries } });
        if(entry.length == 0) return next({status: 404, message: "Entry does not exists"});

        entry = entry[0];
        if(req.blog.checkPermission(req.user) || req.user.is_staff){
            for(let key in body){
                entry[`${key}`] = body[`${key}`];
            }
            
            try{
                await entry.save();
            }
            catch(err){
                return next(err);
            }
            
            let path = `${req.protocol}://${req.hostname}/blog/${req.blog.slug}/${entry.slug}`;
            return res.json({data: {...entry._doc, url: path}});
        }
    },

    async getComments(req, res, next){
        const { entry_slug } = req.params;
        let blog_entries = await Blog.aggregate(
            [ 
                { $match: { slug: req.blog.slug }},
                { $unwind: { path: "$entries" }},
                { $project: { entries: 1, _id: 0}}
            ])
        blog_entries = blog_entries.map(e => e.entries);
        let entry = await Entry.find({slug: entry_slug, _id: { $in: blog_entries } });
        if(entry.length == 0) return next({status: 404, message: "Entry does not exists"});

        entry = entry[0];
        let comments = []
        for(let i=0; i < entry.comments.length; i++){
            if(entry.comments[i].author){
                comments.push({...entry.comments[i]._doc, author: await User.getUserById(entry.comments[i].author)})
            }
            
        }
        res.json(comments)
    },

    async addComment(req, res, next){
        const { entry_slug } = req.params;
        const { content } = req.body;
        let blog_entries = await Blog.aggregate(
            [ 
                { $match: { slug: req.blog.slug }},
                { $unwind: { path: "$entries" }},
                { $project: { entries: 1, _id: 0}}
            ])
        blog_entries = blog_entries.map(e => e.entries);
        let entry = await Entry.find({slug: entry_slug, _id: { $in: blog_entries } });
        if(entry.length == 0) return next({status: 404, message: "Entry does not exists"});
        entry[0].comments.push({content: content, author: req.user})
        await entry[0].save()
        res.json({content: content, author: req.user});
    },

    async updateComment(req, res, next){

    },

    async deleteComment(req, res, next){

    },

}