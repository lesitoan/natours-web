class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // thuộc tính này dành cho các lỗi operational

        Error.captureStackTrace(this, this.constructor);
    }
} 

module.exports = AppError;