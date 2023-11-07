const mongoose = require('mongoose');
const dotenv = require('dotenv');

const app = require('./app');
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
(async () => {
    try {
        await mongoose.connect(DB, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        });
        console.log('DB connection successful!');
    } catch(err) {
        console.log('Connect ERR: ', err);
    }
})();

const port =process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`app is running on port ${port}`);
})