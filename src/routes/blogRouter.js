import { Router } from 'express';
import blog from '../controllers/blogController';
import entry from '../controllers/entryController';
import middlewares from '../middlewares';

const router = Router();
/*

/blog - GET
/blog - POST
/blog/:slug - GET
/blog/:slug - POST
/blog/:slug - PATCH
/blog/:slug - DELETE
/blog/:slug/:title - GET
/blog/:slug/:title - PATCH
/blog/:slug/:title - DELETE
/blog/:slug/:title/comments - GET
/blog/:slug/:title/comments - POST
*/

router.get('/' , middlewares.promisifyRedis,  blog.findAll);
router.post('/', middlewares.verifyToken, blog.create);
router.get('/:blog_slug', [middlewares.findBlog, middlewares.promisifyRedis], blog.findOne);
router.post('/:blog_slug', [middlewares.verifyToken, middlewares.findBlog], entry.create);
router.patch('/:blog_slug', [middlewares.verifyToken, middlewares.findBlog], blog.update);
router.delete('/:blog_slug', [middlewares.verifyToken, middlewares.findBlog], blog.delete);
router.get('/:blog_slug/:entry_slug', [middlewares.findBlog, middlewares.promisifyRedis], entry.findOne);
router.patch('/:blog_slug/:entry_slug', [middlewares.findBlog, middlewares.verifyToken], entry.update);
router.delete('/:blog_slug/:entry_slug', [middlewares.findBlog, middlewares.verifyToken], entry.delete);
router.get('/:blog_slug/:entry_slug/comments', middlewares.findBlog, entry.getComments);
router.post('/:blog_slug/:entry_slug/comments', [middlewares.verifyToken,middlewares.findBlog], entry.addComment);

export default router;