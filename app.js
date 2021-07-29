
if(process.env.NODE_ENV != 'production'){
    require('dotenv').config()
}


const express = require('express');
const app = express();
const flash = require('connect-flash');
const session = require('express-session');
const methodOverride = require('method-override');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');


//routes
const mealsRoutes = require('./routes/Meals');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const cartRoutes = require('./routes/cart');
const paymentRoutes = require('./routes/payment');



app.set('view engine','ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodOverride('_method'));

const sessionConfig = {
    secret: 'weneedsomebettersecret',
    resave: false,
    saveUninitialized: true
}

app.use(session(sessionConfig));
app.use(flash());

// Initilising the passport and sessions for storing the users info
app.use(passport.initialize());
app.use(passport.session());

// configuring the passport to use local strategy
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
});



app.use(mealsRoutes);
app.use(authRoutes);
app.use(userRoutes);
app.use(cartRoutes);
app.use(paymentRoutes);


const mongoose = require('mongoose');

mongoose.connect(`${process.env.DB_URLs}`, 
{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify:false
})
.then(()=>{
    console.log("DB Connected");
})
.catch(err=>{
    console.log(err);
})




app.listen(3000,()=>{
    console.log('Server started on Port 3000');
})