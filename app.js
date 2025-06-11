const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require("dotenv")
const requestLogger = require("./middlewares/requestLogger");
const connectiontoMogodbcluster = require("./configuration/database")

//routes
const authroute = require("./routes/auth.route")



dotenv.config();
const app = express();
const allowedOrigins = ['http://localhost:5173'];

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true, }));
app.use(express.static(path.join(__dirname, 'public')));
//request display in console
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
  app.use(requestLogger);
}
//db connection
connectiontoMogodbcluster();


//api endpoints
app.get("/", (req, res) => {
  res.send("server is running!")
})

app.use("/api/v1/", authroute)


app.use(function (req, res, next) {
  next(createError(404));
});
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
