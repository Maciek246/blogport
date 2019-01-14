import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    username: { 
        type: String,
        required: [true, "can't be blank"],
        index: { unique: true } 
    },
    password: { 
        type: String,
        required: true 
    },
    email: {
        type: String,
        required: [true, "can't be blank"],
    },
    data_of_join: { 
        type: Date, 
        default: Date.now 
    },
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    description: { 
        type: String, 
        required: false 
    },
    is_staff: { 
        type: Boolean, 
        default: false 
    },
    last_login: {
        type: Date
    }
}, {
    versionKey: false
});


userSchema.pre('save', async function(next) {
    var user = this;
    if (!user.isModified('password')) return next();

    try {
        const hash = await bcrypt.hash(user.password, parseInt(process.env.SALT_WORK_FACTOR))
        user.password = hash;
        next();
    }
    catch(err) {
        net(err);
    }
});

userSchema.methods.generateJWT = function(){
    return jwt.sign({_id: this._id, username: this.username}, process.env.SECRET_KEY);
}

userSchema.methods.toAuthJSON = function(){
    return {
        _id: this._id,
        username: this.username,
        email: this.email,
        token: this.generateJWT(),
        description: this.description,
    };
};

userSchema.methods.toJSON = function(){
    return {
        _id: this._id,
        username: this.username,
        email: this.email,
        description: this.description,
        first_name: this.first_name,
        last_name: this.last_name,
        data_of_join: this.data_of_join
    }
}

userSchema.methods.checkPassword = async function(password){
    const user = this;
    const result = await bcrypt.compare(password, user.password);
    return result;
}

userSchema.statics.getUserById = async function(id){
    const a = await this.findOne({_id: id});
    let u = a.username
    return u
}

export default mongoose.model('User', userSchema);