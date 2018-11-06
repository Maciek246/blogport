import { Router } from 'express';
import blog from '../controllers/blogController';
import middlewares from '../middlewares';

const router = Router();
/*

/blog - GET
/blog - POST
/blog/:slug - GET
/blog/:slug - POST
/blog/:slug/:title - GET
/blog/:slug/:title - PATCH
/blog/:slug/:title - DELETE
/blog/:slug/:title/comments - GET
/blog/:slug/:title/comments - POST
/blog/:slug/:title/comments - DELETE
/blog/:slug/:title/comments - PATCH

*/

router.get('/' , blog.findAll);
router.post('/', middlewares.verifyToken, blog.create);
router.get('/:blog_slug', blog.findOne);
router.patch('/:blog_slug', middlewares.verifyToken, blog.update);

export default router;