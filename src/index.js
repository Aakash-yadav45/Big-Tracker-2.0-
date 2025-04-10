require('dotenv').config();
const express = require('express');
const cookieParser = require("cookie-parser");
const connectDB = require('./Config/db');
const app = express();

// Import Routes
const routes = require('./Routes/index.Routes');
const { errorHandler } = require('./Middlewares/errorHandler');

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public/images'));
app.use(express.static('public/audio'));
app.use(cookieParser()); // Parse cookies

// Set the view engine (EJS example)
app.set('view engine', 'ejs');


//Connect to mongoDB
connectDB();

app.use('/api', routes);

app.use((req, res) => {
    res.status(404).render('404');
});

app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`server listen on http://localhost:${port}`);
})

