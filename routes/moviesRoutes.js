const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const moviesControllers=require('../controllers/movies.controller');

router.get('/getmovies', async(req,res)=>{
    try{
        const result=await moviesControllers.getMovies();
        res.json({ moviesList: result });
    }catch(error){
        console.log(error);
        res.json({error:error});
    }
});

router.get('/getmovie/:id', async(req,res)=>{
    try{
        movieId=req.params.id;
        const result=await moviesControllers.getMovie(movieId);
        res.json({result: result});
    }catch(error){
        console.log(error);
        res.json({error:error});
    }
});

router.get('/getmovieidbyname/:moviename', async(req,res)=>{
    try{
        movieName=req.params.moviename;
        const result=await moviesControllers.getMovieIdByName(movieName);
        res.json({result: result});
    }catch(error){
        console.log(error);
        res.json({error:error});
    }
});

//requiring middleware for token checking
const { tokenChecking } = require('../middlewares/checkingPermissions.js');
router.use(tokenChecking);

router.post('/addmovie',body('name').notEmpty(), body('releaseddate').notEmpty(), body('descrption').notEmpty(), body('movieposter').notEmpty() , async(req,res)=>{
    try{
        const err=validationResult(req);
        if(!err.isEmpty()){
            throw 'Data validation Error';
        }
        const payload=req.body;
        const result=await moviesControllers.addMovie(payload);
        res.json(result);
    }catch(error){
        console.log(error);
        res.json({error:error});
    }
});

router.put('/editmovie/:id', body('name').notEmpty(), body('releaseddate').notEmpty(), body('descrption').notEmpty(), body('movieposter').notEmpty() , async(req,res)=>{
    try{
        const err=validationResult(req);
        if(!err.isEmpty()){
            throw 'Data validation Error';
        }
        const movieId=req.params.id;
        const payload=req.body;
        const result=await moviesControllers.addMovie(movieId, payload);
        res.json(result);
    }catch(error){
        console.log(error);
        res.json({error:error});
    }
});

router.delete('/deletemovie/:id', async(req,res)=>{
    try{
        const movieId=req.params.id;
        const result=await moviesControllers.deleteMovie(movieId);
        res.json(result);
    }catch(error){
        console.log(error);
        res.json({error:error});
    }
});



module.exports = router;