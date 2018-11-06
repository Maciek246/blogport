import Blog from '../models/Blog';

export default {
    
    async create(req, res, next){
        const name = req.body.name;
        try{
            const blog = await Blog.create({name});
            let path = `${req.protocol}://${req.hostname}${req.originalUrl}/${blog.slug}`;
            res.json({name: blog.name, url: path})
        }
        catch(err){
            next(err);
        }
    },

    async findOne(req, res, next){
        const slug = req.params.blog_slug;
        const blog = await Blog.findOne({slug: slug});
        if(!blog) return next();
        res.status(200).json({data: blog});
    },

    async findAll(req, res, next){
        const blogs = await Blog.find({});
        if(!blogs) return next();
        res.status(200).json({total: blogs.length, data: blogs});
    },

    async update(req, res, next){
        const slug = req.params.blog_slug;
        const body = req.body;
        let blog = await Blog.findOne({slug: slug})
        if(!blog) return next({status: 404, message: "Not found"})

        if(blog.author == req.user || req.user.is_staff){
            for(let key in body){
                console.log(key);
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
    }
}