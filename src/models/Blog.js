import mongoose from 'mongoose';
import URLSlugs from 'mongoose-url-slugs';

const blogSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "can't be blank"],
        index: { unique: true },
    },
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
	category: {
		type: String,
		required: [true, "can't be blank"],
		index: true,
	},
    entries: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entry' 
    }]
},{
    versionKey: false
});

blogSchema.plugin(URLSlugs('name', {field: 'slug', update: true}));

blogSchema.methods.checkPermission = function(user){
    if(this.author.equals(user._id)){
        return true;
    }
    return false;
}

export default mongoose.model('Blog', blogSchema);