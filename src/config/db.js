const mongoose = require('mongoose')

const url = 'mongodb+srv://vikasborse000:gvTAe0lbHSccOAVr@cluster0.5izdipr.mongodb.net/finalpro?retryWrites=true&w=majority&appName=Cluster0'

const dbConnection = async () => {
    try {
        await mongoose.connect(url)
        console.log('Database Connected')
    } catch (error) {
        console.log(error)
    }
}
module.exports = dbConnection;