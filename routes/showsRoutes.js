const express = require('express');
const router = express.Router();

//to validate the data
const { body, validationResult } = require('express-validator');

//database pg connection
const { configDb } = require('../config.js');
const knexConfig = configDb.knexPGConfig;
const knex = require('knex')(knexConfig);












//getting a show by movieid
router.get('/getshows/:movieid', async (req, res) => {
  try {
    console.log(req.body);
    const result = await knex.withSchema('cinemabackend').table('cinemas_movies').andWhere('isactive', true).andWhere('movieid', req.params.movieid);
    console.log(result);
    res.json({ shows: result });
  }
  catch (error) {
    console.log('catch' + error);
    res.status(400);
  }
})



//getting all shows
router.get('/getshows', async (req, res) => {
  try {

    console.log('getting all shows');
    const result = await knex.withSchema('cinemabackend').table('cinemas_movies').andWhere('isactive', true);
    console.log(result);
    res.json({ result: result });
  }
  catch (error) {
    console.log('catch' + error);
    res.status(400);
  }
})



//getting a show by showid
router.get('/getshow/:id', async (req, res) => {
  try {
    console.log(req.body);
    let result = await knex.withSchema('cinemabackend').table('cinemas_movies').andWhere('isactive', true).andWhere('id', req.params.id);
    result=result[0];
    console.log(result);

    result.screeningtime=result.screeningtime.split(',');

    movieArr=await knex.withSchema('cinemabackend').table('moviesdetails').where('id',result.movieid);
    cinemaArr=await knex.withSchema('cinemabackend').table('cinemasdetails').where('id',result.cinemaid);

    result.moviename=movieArr[0].name;
    result.cinemaname=cinemaArr[0].name;
    

    console.log(result);
    res.json({ show: result });
  }
  catch (error) {
    console.log('catch' + error);
    res.status(400);
  }
})




//getting a show by cinemaid
router.get('/getshowsbycinemaid/:cinemaid', async (req, res) => {
  try {
    const result = await knex.withSchema('cinemabackend').table('cinemas_movies').where('cinemaid', req.params.cinemaid);
    console.log(result);
    res.json({ result: result });
  }
  catch (error) {
    console.log('catch' + error);
    res.status(400);
  }
})



//requiring middleware
const { tokenChecking } = require('../middlewares/checkingPermissions.js');
router.use(tokenChecking);


//adding a show
router.post('/addshow', async (req, res) => {
  try {
    console.log('adding a new-show');

    const err = validationResult(req);
    if (!err.isEmpty() || !req.body.screeningtime || !req.body.startscreeningdate || !req.body.endscreeningdate || !req.body.moviename || !req.body.cinemaname || !req.body.screen) {
      res.status(400).json({ error: 'error: please enter proper details' });
    }
    console.log(req.body);

    moviesArr=await knex.withSchema('cinemabackend').table('moviesdetails').where('name',req.body.moviename);
    cinemasArr=await knex.withSchema('cinemabackend').table('cinemasdetails').where('name',req.body.cinemaname);

    obj={
      movieid:moviesArr[0].id,
      cinemaid:cinemasArr[0].id,
      screen:req.body.screen,
      startscreeningdate: req.body.startscreeningdate,
      endscreeningdate: req.body.endscreeningdate,
      screeningtime: req.body.screeningtime.toString()
    }
    console.log(obj);
    
    await knex.withSchema('cinemabackend').table('cinemas_movies').insert(obj);
    res.json({ message: 'success: show is added successfully' });
  }
  catch (error) {
    console.log('catch' + error);
    res.status(400);
  }
});



//updating a show
router.put('/editshow/:id',  async (req, res) => {
  try {
    console.log('editing a show');

    const err = validationResult(req);
    if (!err.isEmpty() || !req.body.screeningtime || !req.body.startscreeningdate || !req.body.endscreeningdate || !req.body.moviename || !req.body.cinemaname || !req.body.screen) {
      res.status(400).json({ error: 'error: please enter proper details' });
    }

    console.log(req.body);

    moviesArr=await knex.withSchema('cinemabackend').table('moviesdetails').where('name',req.body.moviename);
    cinemasArr=await knex.withSchema('cinemabackend').table('cinemasdetails').where('name',req.body.cinemaname);

    const result = await knex.withSchema('cinemabackend').table('cinemas_movies').where('id', req.params.id).update(
      {
        movieid:moviesArr[0].id,
        cinemaid:cinemasArr[0].id,
        screen:req.body.screen,
        startscreeningdate: req.body.startscreeningdate,
        endscreeningdate: req.body.endscreeningdate,
        screeningtime: req.body.screeningtime.toString()
      }
    )

    if (result) {
      res.json({ message: 'updated successfully' });
    }
    else {
      res.json({ error: 'show is not found' });
    }
  }
  catch (error) {
    console.log('catch' + error);
    res.status(400);
  }
});



//deleting a show
router.delete('/deleteshow/:id', async (req, res) => {
  try {
    console.log('deleting a particular show');
    const result = await knex.withSchema('cinemabackend').table('cinemas_movies').where('id', req.params.id).update({ isactive: false });
    if (result) {
      res.json({ message: 'deleted successfully' });
    }
    else {
      res.json({ error: 'show is not found' });
    }
  }
  catch (error) {
    console.log('catch' + error);
    res.status(400);
  }
})

module.exports = router;





