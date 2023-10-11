const { dbName } = require("../constant/constant");
require('../model/user');

const mongoose = require('mongoose');

const mongoURI = process.env.MONGODB_URI + dbName;


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