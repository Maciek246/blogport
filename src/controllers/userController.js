import User from '../models/User';

export default {

    async getUserMe(req, res){
        res.status(200).json(req.user.toJSON());
    },

    async getUser(req, res, next){
        const user = await User.findOne({username: req.params.username});
        if(!user) return next({status: 404, message: "User does not exist"});
        res.status(200).json({user: user.toJSON()});
    },
    
    async register(req, res, next){
        const { username, password, password2, email, first_name, last_name } = req.body;
        if(password !== password2) return next({message: "Password and confirm password aren't equal", status: 400})

        User.create({ username, password, email, first_name, last_name, date_of_join: new Date() }).then(user => {
            res.json({ user: user.toAuthJSON() })
        }).catch(err => {
            next(err)
        })
    },

    async login(req, res, next){
        const { username, password } = req.body;
        if(!username || !password) return next({status: 400, message: "Missing authorization data"})
        try{
            let user = await User.findOne({username: username});
            if(user){
                if(user.checkPassword(password)){
                    user.last_login = new Date();
                    user.save();
                    res.json({ user: user.toAuthJSON() })
                }
                else{
                    next({status: 400, message: "Password incorrect"})
                }
            }
        }
        catch(err){
            return next(err);
        }
    },

}