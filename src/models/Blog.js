import mongoose from 'mongoose';
import URLSlugs from 'mongoose-url-slugs';

const blogSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "can't be blank"],
        unique: true
    },
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    entries: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entry' 
    }]
},{
    versionKey: false
});

blogSchema.plugin(URLSlugs('name', {field: 'slug', update: true}));

export default mongoose.model('Blog', blogSchema);