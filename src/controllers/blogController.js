import Blog from '../models/Blog';

export default {
    
    async create(req, res, next){
        const name = req.body.name;
        try{
            const blog = await Blog.create({name, author: req.user});
            let path = `${req.protocol}://${req.hostname}${req.originalUrl}/${blog.slug}`;
            res.json({name: blog.name, url: path})
        }
        catch(err){
            next(err);
        }
    },

    async findOne(req, res, next){
        const blog = req.blog;
        res.status(200).json({data: blog});
    },

    async findAll(req, res, next){
        const blogs = await Blog.find({});
        if(!blogs) return next();
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