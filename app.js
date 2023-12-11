const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controlllers/errorController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'))
console.log(path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, 'public')));

// global middlewares:
// bảo vệ header
app.use(helmet());

// giới hạn request từ 1 IP
const limiter = rateLimit({
    max: 100,
    windowMs: 60*60*1000, // 1 hour
    message: "Too many requests from this IP, please try again an hour !!!",
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
// app.use(express.urlencoded({extended: true, limit: '10kb'}));
app.use(cookieParser());

// Ngăn client truyền NoSQL query vào req.body (loại bỏ "." và "$")
app.use(mongoSanitize());

// Ngăn data từ req.body chứ HTML độc hại
app.use(xss());

// Chặn Param độc( vd: sort 2 lần)
app.use(hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}));


app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);


// handle 404
app.all('*', (req, res, next) => {
    next(new AppError(`Can not find ${req.originalUrl}`, 404));
    // khi truyền đối số vào hàm next thì lập tức global error middleware sẽ được gọi
});

app.use(globalErrorHandler);

module.exports =  app;