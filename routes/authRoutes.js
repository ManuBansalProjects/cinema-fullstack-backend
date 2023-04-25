const express = require('express');
const router = express.Router();
const authControllers=require('../controllers/auth.controllers');


router.post('/registration', authControllers.registration);
router.post('/login', authControllers.login);
router.get('/checkjwtforpasswordchange', authControllers.checkJwtForPasswordChange);
router.put('/changepassword', authControllers.changePassword);
router.post('/sendforgotpasswordemail', authControllers.sendForgotPassordEmail);

//middleware-> for token checking
const { tokenChecking, adminChecking, adminAndSelfUserAccess, selfAccess } = require('../middlewares/checkingPermissions');
router.use(tokenChecking);

router.get('/getrole', authControllers.getRole);
router.get('/getusers',adminChecking, authControllers.getUsers);
router.get('/getuser/:id',adminAndSelfUserAccess, authControllers.getUser);
router.get('/getuserbytoken', authControllers.getUserByToken);
router.get('/gettinguserbytoken', authControllers.gettingUserByToken);
router.put('/update', authControllers.update);
router.get('/logout', authControllers.logOut);
router.delete('/delete/:id',adminAndSelfUserAccess, authControllers.delete);
router.get('/sendupdatepasswordlink', authControllers.sendUpdatePasswordLink);



module.exports = router;