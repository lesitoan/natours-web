const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const UserModel = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

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
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role || 'user'
    }
    const user = await UserModel.create(newUser);

    const token = signToken(user._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
});

const login = catchAsync( async(req, res, next) => {
    // check có tồn tại email vaf password
    if(!req.body.email ||!req.body.password) {
        return next(new AppError(`Please provide email and password`, 400));
    };
    // check có tồn tại user
    const user = await UserModel.findOne({email: req.body.email}).select('+password');

    // check password correct
    if(!user || !(await user.checkPassword(req.body.password ,user.password))) {
        return next(new AppError(`Email or Password incorrect. PLease try again !`, 401));
    };
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token,
    });
})

const authMiddleware = catchAsync( async (req, res, next) => {
    // Check có tồn tại token
    let token = '';
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(' ')[1];
    };
    if(!token) {
        return next(new AppError('Please login and try again !!!', 401));
    };
    // Verify token
    const verifyToken = promisify(jwt.verify);
    const  decoded = await verifyToken(token, process.env.JWT_SECRET)
    //  Check user có còn tồn tại trong db
    const user = await UserModel.findById(decoded.id);
    if(!user) {
        return next(new AppError('User belonging to this token does no longer exist !!!', 401));
    }
    // Check user có đổi password sau khi phát hành token
    if(user.changePasswordAfter(decoded.iat)) {
        return next(new AppError('Password changed. Please login and try again', 401))
    }
    req.user = user;
    next();
});

const restrictTo = (...roles) => {
    return (req, res, next) => {
        const curentRoleUser = req.user.role;
        if(!roles.includes(curentRoleUser)) {
            return next(new AppError('You do not have access to this resource', 403));
        }
        next();
    } 
}

const forgotPassword = catchAsync( async (req, res, next) => {
    // kiểm tra user bằng email
    const user = await UserModel.findOne({email: req.body.email});
    if(!user) {
        return next(new AppError("Can not find user with current email", 404))
    }
    // Tạo chuỗi token random 
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Gửi chuỗi token đó về mail
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;
    const message = `Please click this URL in order to reset password \n${resetURL}`;
    
    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token valid for 10 minutes',
            message: message
        });

        res.status(200).json({
            status: 'success',
            message: 'token send to email !!!'
        });
    } catch(err) {
        console.log(err)
        user.passworResetToken = undefined,
        user.passworResetExpires = undefined,
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the mail. Try again later !!!'));
    }

});

const resetPassword = catchAsync( async (req, res, next) => {
    // check user
    const hashPasswordResetToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await UserModel.findOne({
        passwordResetToken: hashPasswordResetToken,
        passwordResetExpires: { $gt: Date.now() }
    })
    if(!user) {
        return next(new AppError('Token are invalid or has expired',400));
    };
    // change password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passworResetExpires = undefined;
    await user.save();
    // login after change password
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token,
    })
});


module.exports = {
    signUp,
    login,
    authMiddleware,
    restrictTo,
    forgotPassword,
    resetPassword
}
