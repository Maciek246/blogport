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
        const { entry_slug } = req.params;
        let blog_entries = await Blog.aggregate(
            [ 
                { $match: { slug: req.blog.slug }},
                { $unwind: { path: "$entries" }},
                { $project: { entries: 1, _id: 0}}
            ])
        blog_entries = blog_entries.map(e => e.entries);
        const author = String(req.blog.author);
        const user_id = String(req.user._id); 
        if(author == user_id || req.user.is_staff){
            const element_to_delete = await Entry.findOne({slug: entry_slug}, {_id: 1})
            await Entry.deleteOne({ _id: element_to_delete._id })
            await Blog.update({slug: req.blog.slug}, { $pull: { entries: element_to_delete._id }} )
            return res.json({message: "Entry deleted"});
        }
        next({status: 403, message: "You have no permission for delete"});
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
        let entry = await Entry.findOne({slug: entry_slug, _id: { $in: blog_entries } });
        if(!entry) return next({status: 404, message: "Entry does not exists"});

        if(req.blog.checkPermission(req.user) || req.user.is_staff){
           
           try{
               await entry.update(body)
           } 
           catch(err){
               return next(err)
           }
           
           // Just update object in memory
           for(let key in body){
                entry[`${key}`] = body[`${key}`];
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
        let entry = await Entry.findOne({slug: entry_slug, _id: { $in: blog_entries } });
        if(!entry) return next({status: 404, message: "Entry does not exists"});
        entry.comments.push({content: content, author: req.user})
        await entry.save()
        res.json({content: content, author: req.user});
    },
}