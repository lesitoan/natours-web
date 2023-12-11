const express = require('express');
const authController = require('../controlllers/authControllser');
const userController = require('../controlllers/userControllser');


const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

router.use(authController.authMiddleware);
router.get('/me', userController.getMe, userController.getUserById);
router.patch('/update-password', authController.updatePassword);
router.patch('/update-me',
    userController.uploadPhotoMiddleware(),
    userController.resizeUserPhoto,
    userController.updateMe);

router.delete('/delete-me', userController.deleteMe);

router.use(authController.restrictTo('admin'));
router.route('/:id')
    .delete(userController.deleteUserById)
    .get(userController.getUserById);

module.exports = router;