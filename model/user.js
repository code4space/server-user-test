const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: false,
    },
    name: {
        type: String,
        required: false,
    },
    position: {
        type: String,
        required: false,
    },
    image: {
        type: String,
        required: false,
    },
    admin: {
        type: Boolean,
        required: true,
    },
});

const Users = mongoose.model('Users', schema);
module.exports = Users