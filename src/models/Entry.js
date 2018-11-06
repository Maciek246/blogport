import mongoose from 'mongoose';

const entrySchema = new monogoose.Schema({
    title: {
        type: String,
        required: [true, "can't be blank"],
        index: true
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
        },
        created: { type: Date }
    }],
},{
    versionKey: false,
    timestamps: true
})

export default mongoose.model('Entry', entrySchema);