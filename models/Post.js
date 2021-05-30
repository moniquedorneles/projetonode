const mongoose = require('mongoose');
const slug = require('slug');

mongoose.Promise = global.Promise;

const ObjectId = mongoose.Schema.Types.ObjectId;

const postSchema = new mongoose.Schema({
    photo:String,
    title:{
        type:String,
        trim:true,
        require:'O post precisa de um titulo!'
    },
    slug:String,
    body:{
        type:String,
        trim:true
    },
    tags:[String],
    author:{
        type:ObjectId,
        ref:'User'
    }
});

postSchema.pre('save', async function(next){
    if(this.isModified('title')) {
        this.slug = slug(this.title, {lower:true});

        const slugRegex = new RegExp(`^(${this.slug})((-[0-9]{1,}$)?)$`, 'i');
        const postsWithSlug = await this.constructor.find({slug:slugRegex});

        if(postsWithSlug.lenght > 0 ) {
            this.slug = `${this.slug}-${postsWithSlug.lenght+1}`;
        }
    }
    next();
});

postSchema.statics.getTagsList = function() {
    return this.aggregate([
        {$unwind:'$tags'},
        {$group:{_id:'$tags', count:{$sum:1}}},
        {$sort:{count:-1}}
    ]);
};

/*postSchema.statics.findPosts = function(filters = {}) {
   return this.find(filters).populate('author');
   
    
}*/

module.exports = mongoose.model('Post', postSchema);
