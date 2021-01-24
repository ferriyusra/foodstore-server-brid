var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// import file product router
const productRouter = require('./app/product/router')

// import file categories router
const categoryRouter = require('./app/categories/router')

// import file tags router
const tagRouter = require('./app/tag/router')

// import file auth router
const authRouter = require('./app/auth/router')

// import file middleware decodeToken
const { decodeToken } = require('./app/auth/midlleware')

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// gunakan middleware decodeToken
app.use(decodeToken());

// gunakan product router
app.use('/api', productRouter);

// gunakan categories router
app.use('/api', categoryRouter)

// gunakan tag router
app.use('/api', tagRouter)

// gunakan auth router
app.use('/auth', authRouter);

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
