const express = require('express');
const authController = require('../controlllers/authControllser');
const userController = require('../controlllers/userControllser');

const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);

router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

router.patch('/update-password', authController.authMiddleware, authController.updatePassword);

router.patch('/update-me', authController.authMiddleware, userController.updateMe);
router.delete('/delete-me', authController.authMiddleware, userController.deleteMe);

module.exports = router;