const express = require('express');
const tourRouter = require('./routes/tourRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controlllers/errorController');

const app = express();

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use("/api/v1/tours", tourRouter);

// handle 404
app.all('*', (req, res, next) => {
    next(new AppError(`Can not find ${req.originalUrl}`, 404));
    // khi truyền đối số vào hàm next thì lập tức global error middleware sẽ được gọi
});

app.use(globalErrorHandler);

module.exports =  app;