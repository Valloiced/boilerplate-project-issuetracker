require('dotenv').config()
let mongoose = require('mongoose')

module.exports = async () => {
    let URI = process.env.MONGO_URI
    await mongoose.connect(URI, {useNewUrlParser: true, useUnifiedTopology: true})
}