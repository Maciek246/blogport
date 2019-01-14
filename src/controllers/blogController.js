import Blog from '../models/Blog';
import User from '../models/User';

export default {
    
    async create(req, res, next){
        const name = req.body.name;
        const category = req.body.category;
        try{
            const blog = await Blog.create({name, author: req.user, category});
            let path = `${req.protocol}://${req.hostname}${req.originalUrl}/${blog.slug}`;
            res.json({name: blog.name, url: path, category: blog.category})
        }
        catch(err){
            next(err);
        }
    },

    async findOne(req, res, next){
        let blog = await Blog.aggregate([
            {
                "$match": {slug: req.params.blog_slug}
            },
            {
                "$lookup": {
                    from: "entries",
                    localField: "entries",
                    foreignField: "_id",
                    as: "entries"
                    }
            }])
        blog = {...blog[0], author: await User.getUserById(blog[0].author)}
        res.status(200).json({data: blog});
    },

    async findAll(req, res, next){
        let blogs = await Blog.aggregate([
            {
                "$lookup": {
                    from: "entries",
                    localField: "entries",
                    foreignField: "_id",
                    as: "entries"
                    }
            }])
        if(!blogs) return next();
        for(let i=0; i < blogs.length; i++){
             if(blogs[i].author){
                 blogs[i] = {...blogs[i], author: await User.getUserById(blogs[i].author)}
             }
        }
        res.status(200).json({total: blogs.length, data: blogs});
    },

    async update(req, res, next){
        const blog = req.blog;
        const body = req.body;
        // Spawdzic czy zadziala jako zwykly user
        if(blog.checkPermission(req.user) || req.user.is_staff){
            for(let key in body){
                blog[`${key}`] = body[`${key}`];
            }
            
            try{
                await blog.save();
            }
            catch(err){
                return next(err);
            }
            
            let path = `${req.protocol}://${req.hostname}/blog/${blog.slug}`;
            return res.json({data: {...blog._doc, url: path}});
        }
        next({status: 403, message: "You have no permission for update"});
    },

    async delete(req, res, next){
        const blog = req.blog;
        // Temporary return only json message and don't delete a blog
        if(blog.author == req.user || req.user.is_staff){            
            return res.json({message: "Blog deleted"});
        }
        next({status: 403, message: "You have no permission for delete"});

    }
}