const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path")
const mongoose = require("mongoose");
const session = require("express-session");
const nocache = require("nocache");
const exp = require("constants");
require("dotenv").config()
const {v4 : uuidv4} = require("uuid");
const user_router = require("./routes/userRoute");
const admin_router = require("./routes/adminRoute")

app.set("view engine","ejs");
app.set("views", [
  path.join(__dirname,"views/user"),
  path.join(__dirname,"views/admin"),
  path.join(__dirname,"views/partials")
])
app.use(express.static(path.join(__dirname,"public")));


app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use("/js",express.static(path.join(__dirname,"public/assets/js")));
app.use("/css",express.static(path.join(__dirname,"public/assets/css")))
app.use('/images',express.static(path.join(__dirname,"public/assets/images")))

app.use(session({
  secret:uuidv4(),
  resave:false,
  saveUninitialized:true
}))

app.use(nocache());

app.use('/admin',admin_router)
app.use('/',user_router);

const port = process.env.PORT;

const connectDB = require('./config/model');
connectDB()

app.listen(port,()=>{
  console.log(`Server is running on http://localhost:${port}/`)
})