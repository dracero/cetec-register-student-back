var dotenv = require("dotenv");
var path = require('path');

dotenv.config({path:path.resolve(__dirname, '..')+'/.env'});

var mongoose = require('mongoose');
const url = process.env.MONGO_URL;

const connection = mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true})
.then(client => {
    console.log('Connected to Database');
});

mongoose.connection.on('connected', ()=> {
    console.log('[Mongoose] - connected in:', url)
})

mongoose.connection.on('error', (err)=> {
    console.log('[Mongoose] - error:', err)
})

module.exports = connection;
