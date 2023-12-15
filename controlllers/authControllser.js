const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const UserModel = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createAndSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // Create cookie
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true, // không cho phép client thay đổi cookie
        secure: false
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);

    // remove password output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

const signUp = catchAsync(async (req, res, next) => {
    const newUser = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role || 'user'
    }
    const user = await UserModel.create(newUser);
    
    // send mail wellcome !!!
    await new Email(user, 'no URL').sendWelcome();

    createAndSendToken(user, 201, res);
});

const login = catchAsync(async (req, res, next) => {
    // check có tồn tại email vaf password
    if (!req.body.email || !req.body.password) {
        return next(new AppError(`Please provide email and password`, 400));
    };
    // check có tồn tại user
    const user = await UserModel.findOne({ email: req.body.email }).select('+password');

    // check password correct
    if (!user || !(await user.checkPassword(req.body.password, user.password))) {
        return next(new AppError(`Email or Password incorrect. PLease try again !`, 401));
    };
    createAndSendToken(user, 200, res);

})

const authMiddleware = catchAsync(async (req, res, next) => {
    // Check có tồn tại token
    let token = '';
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    };
    if (!token) {
        return next(new AppError('Please login and try again !!!', 401));
    };
    // Verify token
    const verifyToken = promisify(jwt.verify);
    const decoded = await verifyToken(token, process.env.JWT_SECRET)
    //  Check user có còn tồn tại trong db
    const user = await UserModel.findById(decoded.id);
    if (!user) {
        return next(new AppError('User belonging to this token does no longer exist !!!', 401));
    }
    // Check user có đổi password sau khi phát hành token
    if (user.changePasswordAfter(decoded.iat)) {
        return next(new AppError('Password changed. Please login and try again', 401))
    }
    req.user = user;
    res.locals.user = user; //res.locals để truyền data cho view, khi sử dụng res.render
    next();
});

const restrictTo = (...roles) => {
    return (req, res, next) => {
        const curentRoleUser = req.user.role;
        if (!roles.includes(curentRoleUser)) {
            return next(new AppError('You do not have access to this resource', 403));
        }
        next();
    }
}

const forgotPassword = catchAsync(async (req, res, next) => {
    // kiểm tra user bằng email
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError("Can not find user with current email", 404))
    }
    // Tạo chuỗi token random 
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Gửi chuỗi token đó về mail
    try {
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();

        res.status(200).json({
            status: 'success',
            message: 'token send to email !!!'
        });
    } catch (err) {
        console.log(err)
        user.passworResetToken = undefined,
            user.passworResetExpires = undefined,
            await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the mail. Try again later !!!'));
    }

});

const resetPassword = catchAsync(async (req, res, next) => {
    // check user
    const hashPasswordResetToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await UserModel.findOne({
        passwordResetToken: hashPasswordResetToken,
        passwordResetExpires: { $gt: Date.now() }
    })
    if (!user) {
        return next(new AppError('Token are invalid or has expired', 400));
    };
    // change password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passworResetExpires = undefined;
    await user.save();
    // login after change password
    createAndSendToken(user, 200, res);
});

const updatePassword = catchAsync(async (req, res, next) => {
    // Kiểm tra user có tồn tại trong collection
    const id = req.user.id;
    const user = await UserModel.findById(id).select("+password");
    // check password hiện tại === password post request
    const checkPassword = await user.checkPassword(req.body.password, user.password);
    if (!checkPassword) {
        return next(new AppError(`Your password is not Exactly, please try again !!!`, 401));
    }
    // check password === newPassword
    if (req.body.password === req.body.newPassword) {
        return next(new AppError(`New password must be different current password !!!`, 400));
    }
    // Đổi password
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;
    await user.save(); // không dùng được findByidAndUpdate vì các middleware trong schema không hoạt động
    // login lại ( gửi lại jwt)
    createAndSendToken(user, 200, res);
})

const isLogedIn = async (req, res, next) => {
    try {
        // Check có tồn tại token
        let token = '';
        if (req.cookies.jwt) {
            token = req.cookies.jwt;
        };
        if (!token) {
            return next();
        };
        // Verify token
        const verifyToken = promisify(jwt.verify);
        const decoded = await verifyToken(token, process.env.JWT_SECRET)
        //  Check user có còn tồn tại trong db
        const user = await UserModel.findById(decoded.id);
        if (!user) {
            return next();
        }
        // Check user có đổi password sau khi phát hành token
        if (user.changePasswordAfter(decoded.iat)) {
            return next();
        }
        res.locals.user = user; //res.locals để truyền data cho view, khi sử dụng res.render
        next();
    } catch (err) {
        next();
    }
};

const logout = (req, res) => {
    res.cookie('jwt', 'loggedOut', {
        expires: new Date(Date.now() + 10*1000),
        httpOnly: true
    });
    res.status(200).json({status: "success"});
}

module.exports = {
    signUp,
    login,
    authMiddleware,
    restrictTo,
    forgotPassword,
    resetPassword,
    updatePassword,
    isLogedIn,
    logout
}
