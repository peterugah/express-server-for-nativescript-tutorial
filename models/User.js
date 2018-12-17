const mongoose = require("mongoose");
const fs = require("fs");
const Schema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: [true, "your email is required"],
        validate: {
            validator: function (value) {
                let emailReg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
                return emailReg.test(value);
            },
            message: 'please enter a valid email address'
        }
    },
    password: {
        type: String,
        required: [true, "your password is required"],
    },
    created_at: {
        type: Date,
        default: Date.now
    },
})


module.exports = mongoose.model("User", Schema ,"users");