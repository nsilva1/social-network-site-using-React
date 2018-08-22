const express = require("express");
const hbs = require("hbs");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const passport = require('passport');

const users = require("./routes/api/userAuth");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

var app = express();
var port = process.env.PORT || 8078;

//Body-parser middleware
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

//DB config
const db = require("./config/keys");

//connect to MongoDB
mongoose
  .connect(db.mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

//passport middleware
app.use(passport.initialize());

//passport config
require('./config/passport')(passport);

//use routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
