const express = require('express');
const router = express.Router();
const cookieParser = require("cookie-parser");
const AuthController = require('../controllers/Auth.controller')
const auth = require ('../middleware/Auth');
router.use(cookieParser());
router.post ('/registerClient', AuthController.registerClient);
router.post ('/activateAccount', AuthController.activateAccount);
router.post ('/login', AuthController.login);
router.put ('/forgotPwd', AuthController.forgotPasswordWithCode);
router.post('/resendForgotCode', AuthController.resendForgotCode);
router.post ('/verifCode', AuthController.verifCodeForgotPassword);
router.put ('/resetPwd', AuthController.resetPassword);
router.post('/logout', AuthController.logout);
router.post('/loginWeb', AuthController.loginWeb);
router.post('/loginfr', AuthController.loginFr);
router.post ('/registerClientWeb', AuthController.registerClientWeb);
router.post ('/activateAccountWeb', AuthController.activateAccountWeb);
module.exports = router;
