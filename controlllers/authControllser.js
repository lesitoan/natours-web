const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const signUp = catchAsync( async (req, res, next) => {
    const newUser = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    }
    const user = await UserModel.create(newUser);

    const token = signToken(user._id);

    res.status(201).json({
        status: 'success',
        data: {
            token,
            user
        }
    });
});

const login = catchAsync( async(req, res, next) => {
    // check có tồn tại email vaf password
    if(!req.body.email ||!req.body.password) {
        return next(new AppError(`Please provide email and password`, 400));
    }
    // check có tồn tại user
    const user = await UserModel.findOne({email: req.body.email}).select('+password');

    // check password correct
    if(!user || !(await user.checkPassword(req.body.password ,user.password))) {
        return next(new AppError(`Email or Password incorrect. PLease try again !`, 401));
    }
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        data: {
            token,
        }
    })
})



module.exports = {
    signUp,
    login
}