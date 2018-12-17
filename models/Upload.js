const mongoose = require("mongoose");
const timer = require("node-time-ago");
let Schema = new mongoose.Schema({
    description : {
        type : String,
        required : [true , "please enter a description"]
    },
    image : {
        type : String,
        required : true,
        unique : [true , "record already exists"],
    },
    resize : {
        type : String,
        required : true,
        unique : [true , "record already exists"],
    },
    created_at : {
        type :Date,
        default : Date.now()
    },
    user_id : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
})
Schema.set('toObject' , {virtuals: true , getters : true});

Schema.virtual("timer").get(function(){
    return timer(this.created_at);
})

module.exports =  mongoose.model("Upload" , Schema , "uploads");