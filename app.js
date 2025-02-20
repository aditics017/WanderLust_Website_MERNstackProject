if(process.env.NODE_ENV != "production") {
  require("dotenv").config();
}



const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo'); 
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listings"); 
const reviewsRouter = require("./routes/reviews");
const usersRouter = require("./routes/users"); 

const dburl = process.env.ATLAS_DB_URL

app.locals.mapToken = process.env.MAP_TOKEN;

app.use((req, res, next) => {
  res.locals.currentPath = req.path; // Pass the current route to all views
  next();
});


// Database Connection
async function main() {
  await mongoose.connect(dburl);
  console.log("Connected to MongoDB");
}
main().catch((err) => console.log(err));

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const store = MongoStore.create({ 
  mongoUrl: dburl, 
  crypto: { 
    secret: process.env.SECRET, 
  }, 
  touchAfter: 24 * 3600 
});

store.on("error", (err) => { 
  console.log("ERROR in MONGO SESSION STORE:", err); 
});


const sessionOptions = { 
  store,
  secret: process.env.SECRET, 
  resave: false, 
  saveUninitialized: true, 
  cookie: { 
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
    maxAge: 7 * 24 * 60 * 60 * 1000, 
    httpOnly: true 
  } 
};

// app.get("/", (req, res) => {
//   res.send("Hi, I am root");
// });


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize()); 
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => { 
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error"); 
  res.locals.currUser = req.user; 
  next(); 
});


// Routers
app.use("/listings", listingsRouter);
app.use("/listings", reviewsRouter); 
app.use("/", usersRouter); 


// 404 Error Handler
app.all("*", (req, res, next) => {
  next(new ExpressError(404, `Page Not Found!: ${req.originalUrl}`));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// Start Server
app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
