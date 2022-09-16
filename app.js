var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var MongoStore = require('connect-mongo');

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var JWTstrategy = require('passport-jwt').Strategy;
var {ExtractJwt} = require('passport-jwt');

var session = require('express-session');
var jwt = require('jsonwebtoken');

require('./config/database.js');
var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Middleware sesssion persists in Mongo
app.use(session({
  store: MongoStore.create({ 
    mongoUrl: `${process.env.MONGO_URL}`,
    ttl: 60 * 10
  }),
  secret: 'secreto',
  resave: true,
  saveUninitialized: true,
}))

app.use(passport.initialize()) // init passport on every route call
app.use(passport.session())    //allow passport to use "express-session"
//Get the GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from Google Developer Console
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

const authUser = (request, accessToken, refreshToken, profile, done) => {

  if (profile._json.domain !== 'fi.uba.ar') {
    return done(new Error("Wrong domain!"));
  }

  return done(null, profile);
}

//set the JWT options
const jwtOptions ={} 
jwtOptions.jwtFromRequest=ExtractJwt.fromExtractors([ExtractJwt.fromUrlQueryParameter("secret_token"), ExtractJwt.fromHeader("secret_token"), ExtractJwt.fromAuthHeaderAsBearerToken()]);
//here we have defined all possible extractors in an array
jwtOptions.secretOrKey = process.env.JWT_SECRET_KEY;

//Use "GoogleStrategy" as the Authentication Strategy
passport.use(new GoogleStrategy({
  clientID:     GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.BACK_URL + "/auth/google/callback",
  passReqToCallback   : true
  }, authUser));


passport.serializeUser( async (user, done) => { 
  console.log(`\n--------> Serialize User:`)
  console.log(user)

  done(null, user)
} )

passport.deserializeUser((user, done) => {
  console.log("\n--------- Deserialized User:")
  console.log(user)

  done (null, user)
})

app.get('/auth/google',
  passport.authenticate('google', {
    hd: 'fi.uba.ar',
    scope: [
      'email',
      'profile'
    ]
  })
);

app.get(
  '/auth/google/callback',
  passport.authenticate("google"),
  async function (req, res) {
    if (req.user) {
      const token = jwt.sign({id:req.user.email}, process.env.JWT_SECRET_KEY, {expiresIn: process.env.TOKEN_KEEP_ALIVE}); 
      res.cookie('token', token);
      
      console.log(req.user.email + " ha iniciado sesión.");  
    }      
    res.redirect(process.env.FRONT_URL);
  }
);

passport.use(new JWTstrategy( 
  jwtOptions,
  async (token, done) => {
    try {
      return done(null, token.id);
    } catch (error) {
      done(error);
    }
  }
)
);

//Here is the secrete of all, passing the value in res.locals variable
app.use((req, res, next) => {
  res.locals.authenticated = req.isAuthenticated();
  next();
});

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === process.env.BACK_URL ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
