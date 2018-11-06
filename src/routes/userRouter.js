import { Router } from 'express';
import user from '../controllers/UserController';
import { verifyToken } from '../middlewares/jwt';

const router = Router();

/*

/user - GET
/user/:username - GET
/user/login - POST
/user/register - POST

*/

router.get('/', verifyToken, user.getUserMe);

router.get('/:username', user.getUser);

router.post('/login', user.login);

router.post('/register', user.register);

export default router;