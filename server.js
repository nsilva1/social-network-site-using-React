const express = require("express");
const hbs = require("hbs");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");

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

//set view engine to handlebars. looks in views folder for html template to render
app.set("view engine", "hbs");

//get URL string and send a response everytime that string appears.
app.get("/", (req, res) => {
  //res.send("");
  res.render("page.hbs", {
    pageTitle: "Wedding Page"
  });
});

//use routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
