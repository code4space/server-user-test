const { dbName } = require("../constant/constant");
require('../model/user');

const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/admin_app' ;

async function connectToDatabase() {
    try {
        await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('connected to MongoDB');
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

function getMongoClient() {
    return mongoose;
}

module.exports = { connectToDatabase, getMongoClient }