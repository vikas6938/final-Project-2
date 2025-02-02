const express = require('express');
const dbConnection = require('./config/db');
const categoryRouter = require('./routes/categoryRoute');
const subCatRouter = require('./routes/subCategoryRoute');
const productRouter = require('./routes/productRoute');
const managerRouter = require('./routes/managerRoute');
const userRouter = require('./routes/userRoute');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const authenticate = require('./middleware/authenticate');
const setUserData = require('./middleware/setUserData');
const ensureUserAccess = require('./middleware/ensureUserAccess');
const app = express()

// port
const PORT = 5000;

// Connect to the database
dbConnection()

// Set up view engine and views directory
app.set('view engine', 'ejs')
app.set('views', 'src/views')

// Set up the public folder to serve static files
app.use(express.static('public'));
app.use(express.static('upload'));
app.use(cookieParser());
app.use(session({
    secret: 'secret_Key',
    resave: false,
    saveUninitialized: false,
}));

// Middleware
app.use(express.urlencoded({ extended: false }))

// Routes
app.use('/category', categoryRouter)
app.use('/subcategory', subCatRouter)
app.use('/product', productRouter)
app.use('/manager', managerRouter)
app.use('/user', userRouter)

app.get('/', authenticate, setUserData, ensureUserAccess, async (req, res) => {
    res.render('Pages/index')
})

// Start the server
app.listen(PORT, (err) => {
    if (err) {
        console.log('server Not Start')
    }
    console.log(`Server : http://localhost:${PORT}`)
})