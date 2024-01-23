const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authControllers=require('../controllers/auth.controllers');
const {fun}=require('../controllers/auth.controllers');

router.get('/getfun',fun);


router.post('/registration', body('name').isLength({min: 3}), body('email').isEmail(), body('password').isLength({min:8}), async(req,res)=>{
    try{
        const err=validationResult(req);
        if(!err.isEmpty()){
            throw 'Data Validation Error';
        }
        const payload=req.body;
        const result=await authControllers.registration(payload);
        res.json(result);
    }catch(error){
        console.log(error);
        res.json({error: error});
    }
});

router.post('/login', body('email').isEmail(), body('password').isLength({min:8}), async(req,res)=>{
    try{
        const err=validationResult(req);
        if(!err.isEmpty()){
            throw 'Data Validation Error';
        }
        const payload=req.body;
        const result=await authControllers.login(payload);
        res.json(result);
    }catch(error){
        console.log(error);
        res.json({error: error});
    }
});

router.get('/checkjwtforpasswordchange', async(req,res)=>{
    try{
        const result=await authControllers.checkJwtForPasswordChange(req.headers.authorization);
        res.json(result);
    }catch(error){
        console.log(error);
        res.json({error: error});
    }
});

router.put('/changepassword',body('password').isLength({min:8}), async(req,res)=>{
    try{
        const err=validationResult(req);
        if(!err.isEmpty()){
            throw 'Data Validation Error';
        }
        const payload=req.body;
        const headers=req.headers;
        const result=await authControllers.changePassword(payload, headers);
        res.json(result);
    }catch(error){
        console.log(error);
        res.json({error: error});
    }
});

router.post('/sendforgotpasswordemail', body('email').isLength({min:8}), async(req,res)=>{
    try{
        const err=validationResult(req);
        if(!err.isEmpty()){
            throw 'Data Validation Error';
        }
        const payload=req.body;
        const result=await authControllers.sendForgotPassordEmail(payload);
        res.json(result);
    }catch(error){
        console.log(error);
        res.json({error: error});
    }
});

//middleware-> for token checking
const { tokenChecking, adminChecking, adminAndSelfUserAccess } = require('../middlewares/checkingPermissions');
router.use(tokenChecking);

router.get('/getrole', async(req,res)=>{
    try{
        const headers=req.headers;
        const result=await authControllers.getRole(headers);
        res.json({result: result});
    }catch(error){
        console.log(error);
        res.json({error: error});
    }
});

router.get('/getusers',adminChecking, async(req,res)=>{
    try{
        const result=await authControllers.getUsers();
        res.json({result: result});
    }catch(error){
        console.log(error);
        res.json({error: error});
    }
});

router.get('/getuser/:id',adminAndSelfUserAccess, async(req,res)=>{
    try{
        userId=req.params.id;
        const result=await authControllers.getUser(userId);
        res.json({result: result});
    }catch(error){
        console.log(error);
        res.json({error: error});
    }
});

router.get('/getuserbytoken', async(req,res)=>{
    try{
        const headers=req.headers;
        const result=await authControllers.getUserByToken(headers);
        res.json({result: result});
    }catch(error){
        console.log(error);
        res.json({error: error});
    }
});

router.get('/gettinguserbytoken', async(req,res)=>{
    try{
        const headers=req.headers;
        const result=await authControllers.gettingUserByToken(headers);
        res.json({result: result});
    }catch(error){
        console.log(error);
        res.json({error: error});
    }
});

router.put('/update', body('name').isLength({ min: 3 }), async(req,res)=>{
    try{
        const err=validationResult(req);
        if(!err.isEmpty()){
            throw 'Data Validation Error';
        }
        const payload=req.body;
        const headers=req.headers;
        const result=await authControllers.update(payload, headers);
        res.json(result);
    }catch(error){
        console.log(error);
        res.json({error: error});
    }
});

router.get('/logout', async(req,res)=>{
    try{
        const headers=req.headers;
        const result=await authControllers.logOut(headers);
        res.json(result);
    }catch(error){
        console.log(error);
        res.json({error: error});
    }
});

router.delete('/delete/:id',adminAndSelfUserAccess, async(req,res)=>{
    try{
        const userId=req.params.id;
        const result=await authControllers.delete(userId);
        res.json(result);
    }catch(error){
        console.log(error);
        res.json({error: error});
    }
});

router.get('/sendupdatepasswordlink', async(req,res)=>{
    try{
        const headers=req.headers;
        const result=await authControllers.sendUpdatePasswordLink(headers);
        res.json(result);
    }catch(error){
        console.log(error);
        res.json({error: error});
    }
});

module.exports = router;