const mongoose = require('mongoose');

async function connectDB () {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connection to database successfull');
    } catch(err) {
        console.log('There was an error connecting to database', err.message)
        process.exit(1);
    }
}

module.exports = connectDB;