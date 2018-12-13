import mongoose from 'mongoose';
import URLSlugs from 'mongoose-url-slugs';

const entrySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "can't be blank"],
        index: { unique: true },
    },
    content: {
        type: String,
        required: [true, "can't be blank"]
    },
    comments: [{
        content: { type: String },
        author: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
},{
    versionKey: false,
    timestamps: true
})

entrySchema.plugin(URLSlugs('title', {field: 'slug', update: true}));

export default mongoose.model('Entry', entrySchema);