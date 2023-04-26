const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const cinemasControllers=require('../controllers/cinemas.controller');

router.get('/getcinemas', async(req,res)=>{
    try{
        const result=await cinemasControllers.getCinemas();
        res.json({result: result});
    }catch(error){
        console.log(error);
        res.json({error: error});
    }
});

router.get('/getcinema/:id', async(req,res)=>{
    try{
        cinemaId=req.params.id;
        const result=await cinemasControllers.getCinema(cinemaId);
        res.json({result: result});
    }catch(error){
        console.log(error);
        res.json({error: error});
    }
});

router.get('/getcinemaidbyname/:cinemaname', async(req,res)=>{
    try{
        cinemaName=req.params.cinemaname;
        const result=await cinemasControllers.getCinemaIdByName(cinemaName);
        res.json({result: result});
    }catch(error){
        console.log(error);
        res.json({error: error});
    }
});

router.get('/getcinemabyname/:cinemaname', async(req,res)=>{
    try{
        cinemaName=req.params.cinemaname;
        const result=await cinemasControllers.getCinemaByName(cinemaName);
        res.json({result: result});
    }catch(error){
        console.log(error);
        res.json({error: error});
    }
});

router.get('/get-states-and-cities', async(req,res)=>{
    try{
        const result=await cinemasControllers.getStatesAndCities();
        res.json({result: result});
    }catch(error){
        console.log(error);
        res.json({error: error});
    }
});

//middleware-> for token checking
const { tokenChecking } = require('../middlewares/checkingPermissions.js');
router.use(tokenChecking);

router.post('/addcinema', body('name').notEmpty(), body('address').notEmpty(), body('contactnumber').notEmpty(), body('stateid').notEmpty(), 
body('cityid').notEmpty(), async(req,res)=>{
    try{
        const err=validationResult(req);
        if(!err.isEmpty()){
            throw 'Data Validation Error';
        }
        const payload=req.body;
        const result=await cinemasControllers.addCinema(payload);
        res.json(result);
    }catch(error){
        console.log(error);
        res.json({error: error});
    }
});

router.put('/editcinema/:id', body('name').notEmpty(), body('address').notEmpty(), body('contactnumber').notEmpty(), body('stateid').notEmpty(), 
body('cityid').notEmpty(), async(req,res)=>{
    try{
        const err=validationResult(req);
        if(!err.isEmpty()){
            throw 'Data Validation Error';
        }
        const payload=req.body;
        const cinemaId=req.params.id;
        const result=await cinemasControllers.editCinema(cinemaId, payload);
        res.json(result);
    }catch(error){
        console.log(error);
        res.json({error: error});
    }
});

router.delete('/delete/:id', async(req,res)=>{
    try{
        cinemaId=req.params.id;
        const result=await cinemasControllers.deleteCinema(cinemaId);
        res.json(result);
    }catch(error){
        console.log(error);
        res.json({error: error});
    }
});

router.put('/changecinemastatus/:cinemaid',body('status').isBoolean(), async(req,res)=>{
    try{
        const err=validationResult(req);
        if(!err.isEmpty()){
            throw 'Data Validation Error';
        }
        cinemaId=req.params.cinemaid;
        cinemaStatus=req.body.status;
        const result=await cinemasControllers.changeCinemaStatus(cinemaId, cinemaStatus);
        res.json(result);
    }catch(error){
        console.log(error);
        res.json({error:error});
    }
});

router.delete('/delete-screen/:screenid', async(req,res)=>{
    try{
        screenId=req.params.screenid;
        const result=await cinemasControllers.deleteScreen(screenId);
        res.json(result);
    }catch(error){
        console.log(error);
        res.json({error:error});
    }
});

module.exports = router;






















// //listing all the cinemas details
// //for both
// router.get('/getactivecinemas', async (req, res) => {
//   try {
//     console.log('listing active cinemas details');
//     const result = await knex.withSchema('cinemabackend').table('cinemasdetails').where('isactive', true);
//     res.json(result);
//   }
//   catch (error) {
//     console.log(error);
//     res.status(400);
//   }
// });


// //for both
// router.get('/getunactivecinemas', async (req, res) => {
//   try {
//     console.log('listing unactive cinemas details');
//     const result = await knex.withSchema('cinemabackend').table('cinemasdetails').where('isactive', false);
//     res.json(result);
//   }
//   catch (error) {
//     console.log(error);
//     res.status(400);
//   }
// });



