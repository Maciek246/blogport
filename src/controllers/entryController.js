import Entry from '../models/Entry';
import Blog from '../models/Blog';

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
            res.json({url: path, data: entry});
        }
        catch(err){
            next(err);
        }

    },
    async findOne(req, res, next){
        const { blog_slug, entry_slug} = req.params;
        const blog = await Blog.findOne({slug: blog_slug});
        if(!blog) return next({status: 404, message: "Blog does not exists"});
        const entry = await Entry.findOne({slug: entry_slug});
        if(!entry) return next({status: 404, message: "Entry does not exists"});
        res.json({data: entry});

    },

    async delete(req, res, next){

    },

    async update(req, res, next){

    },

    async getComments(req, res, next){

    },

    async addComment(req, res, next){

    },

    async updateComment(req, res, next){

    },

    async deleteComment(req, res, next){

    },

}