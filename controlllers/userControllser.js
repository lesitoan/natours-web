const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const UserModel = require('../models/userModel');
const handlerFactory = require('./handlerFactory');

const updateMe = catchAsync (async (req, res, next) => {
    // check user update password
    if(req.body.password) {
        return next(new AppError('Can not update password this URL, try in orther URL !!!', 400));
    }
    // filter data user
    const filedsAllowUpdate = ['name', 'email'];
    const dataUpdate = {};
    Object.keys(req.body).forEach(el => {
        if(filedsAllowUpdate.includes(el)) {
            dataUpdate[el] = req.body[el];
        };
    });
    // update date user
    const userUpdated = await UserModel.findByIdAndUpdate(req.user._id, dataUpdate, {new: true, runValidators: true});
    res.status(200).json({
        status: "success",
        data: {
            user: userUpdated
        }
    });
});

const deleteMe = catchAsync ( async (req, res, next) => {
    // Không xóa user vĩnh viễn, chỉ update filed "active: false"
    await UserModel.findByIdAndUpdate(req.user._id, {active: false}, {runValidators: true});
    res.status(204).json({
        status: "success",
        data: {
            user: null
        }
    });
});

const getMe = (req, res, next) => {
    req.params.id = req.user._id;
    next();
}

const deleteUserById = handlerFactory.deleteOne(UserModel);
const getUserById = handlerFactory.getOne(UserModel);


module.exports = {
    updateMe,
    deleteMe,
    deleteUserById,
    getUserById,
    getMe
}