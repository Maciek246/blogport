import Blog from '../models/Blog';

export const findBlog = async (req, res, next) => {
    const { blog_slug } = req.params;
    const blog = await Blog.findOne({slug: blog_slug});
    if(!blog) return next({status: 404, message: "Blog does not exists"});
    req.blog = blog;
    next();
}