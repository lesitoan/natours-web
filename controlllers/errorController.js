const AppError = require("../utils/appError");

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack
    });
}

const sendErrorProd = (err, res) => {
    if(err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        res.status(500).json({
            status: 'error',
            message: 'Something error from the server !!!!!!!',
        });
    }
}

const handleCastErrorDB = (err) => {
    console.log(err)
    return new AppError(`invalid ${err.path}: ${err.value}`, 400);
}

const handleDuplicateFiledsDB = (err) => {
    const start = err.errmsg.indexOf("\"");
    const end = err.errmsg.lastIndexOf("\"") + 1;
    const value = err.errmsg.slice(start, end);
    return new AppError(`Duplicate field value: ${value}. Please use another value !`, 400)
}

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => {
        return el.message;
    });
    return new AppError(`Invalid input data: ${errors.join(', ')}`, 400);
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error'
    if(process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        // Lưu ý: một số thuộc tính của "err" như "name" sẽ được định nghĩa trong "prototype chain"
        // nên khi console.log(err) sẽ k tìm thấy 1 số thuộc tính đó
        let error = {};

        if( err.name === "CastError") { //Nhập sai data params trên URL
            error = handleCastErrorDB(err);
        }
        if(err.code === 11000) { //Nhập trùng data của trường unique
            error = handleDuplicateFiledsDB(err);
        }
        if(err.name === 'ValidationError') { //Nhập sai trường required
            error = handleValidationErrorDB(err);
        }

        sendErrorProd(error, res);
    }
};