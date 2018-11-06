import jwt from 'jsonwebtoken';
import User from '../models/User';

export const verifyToken = async (req, res, next) => {
    let headers = req.headers;
    if(!('authorization' in headers)) return next({status: 401, message: "Missing authorization token"});
    let authorizationHeader = req.headers.authorization.split(" ");

    if(authorizationHeader[0] != process.env.JWT_TOKEN_PREFIX) return next({status: 401, message: "Invalid token prefix"});
    
    jwt.verify(authorizationHeader[1], process.env.SECRET_KEY, async (err, decoded) => {
        if(err) {
            err.status = 401;
            return next(err);
        }

        const user = await User.findById(decoded._id).catch(err => null);
        req.token = authorizationHeader[1];
        req.user = user;
        next()
    });
}