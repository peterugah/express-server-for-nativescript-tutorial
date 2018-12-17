var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fileUpload = require("express-fileupload");
var cors = require("cors");
var routes = require('./routes/index');
var users = require('./routes/users');
var mongoose  = require("mongoose");

mongoose.connect("mongodb://localhost:27017/photo-app" , {useNewUrlParser : true , useCreateIndex : true})
.then(res=>console.log("connected"))
.catch(err=>console.log(err))

process.env.HOST = "http://localhost:3000"

var app = express();
app.set("host" , "http://localhost:3000")
app.disable('etag'); 
app.disable("x-powered-by");
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//others 
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json({
    limit :'50mb'
}));
app.use(bodyParser.urlencoded({
    limit : '50mb'
}));
app.use(fileUpload({
    //limits: { fileSize: 50 * 1024 * 1024 * 1024 },
}))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
//raw body

/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;