const mongoose = require('mongoose');
const dotenv = require('dotenv');

// uncaught exception -> đóng server
process.on('uncaughtException', err => {
    console.log('UNHANDLED EXCEPTION !, SHUTTING DOWN SERVER....');
    process.exit(1);
})

const app = require('./app');
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {
    console.log('DB connection successful!');
});

const port =process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`app is running on port ${port}`);
})

// lỗi promise chưa được xử lí (connect db thất bại) -> đóng server
process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION !, SHUTTING DOWN SERVER....');
    server.close(() => {
        process.exit(1);
    });
})