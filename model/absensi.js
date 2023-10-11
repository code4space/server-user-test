const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    tgl_masuk: {
        type: Date,
        required: false,
    },
    tgl_pulang: {
        type: Date,
        required: false,
    },
    tgl_pulang: {
        type: Schema.Types.Mixed, // Change the data type to Boolean
        required: false,
    },
});

const Absents = mongoose.model('Absents', schema);
module.exports = Absents