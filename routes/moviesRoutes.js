const express = require('express');
const router = express.Router();


//database pg connection
const { configDb } = require('../config.js');
const knexConfig = configDb.knexPGConfig;
const knex = require('knex')(knexConfig);

//validating data
const { body, validationResult } = require('express-validator');



//requiring middleware for token checking
const { tokenChecking } = require('../middlewares/checkingPermissions.js');
router.use(tokenChecking);



//creating routes
//displaying all the movies 
router.get('/getmovies', async (req, res) => {
  try {
    const result = await knex.withSchema('cinemabackend').table('moviesdetails').where('isactive', true);
    console.log(result);
    res.json({ moviesList: result });
  }
  catch (error) {
    console.log('catch' + error);
    res.status(400);
  }
})



//displaying a particular movie
router.get('/getmovie/:id', async (req, res) => {
  try {
    console.log('listing a particular movie details');
    const result = await knex.withSchema('cinemabackend').table('moviesdetails').where('id', req.params.id);
    console.log(result[0]);
    res.json({ result: result[0] });
  }
  catch (error) {
    console.log('catch' + error);
    res.status(400);
  }
});


router.get('/getmovieidbyname/:moviename', async (req, res) => {
  try {
    console.log('getting a movieid by  movie name');
    const result = await knex.withSchema('cinemabackend').table('moviesdetails').where('name', req.params.moviename);
    console.log(result[0]);
    res.json({ result: result[0].id });
  }
  catch (error) {
    console.log('catch' + error);
    res.status(400);
  }
});

//adding a new movie
router.post('/addmovie', body('releaseddate').isDate(), async (req, res) => {
  try {
    const err = validationResult(req);
    if (!err.isEmpty() || !req.body.name || !req.body.descrp) {
      res.status(400).json({ message: 'fields are not proper' });
    }

    await knex.withSchema('cinemabackend').table('moviesdetails').insert(req.body);
    res.json({ message: 'movie is inserted successfully' });
  }
  catch (error) {
    console.log('catch' + error);
    res.status(400);
  }
});




//updating a existing movie
router.put('/editmovie/:id', body('releaseddate').isDate(), async (req, res) => {
  try {
    const err = validationResult(req);
    if (!err.isEmpty() || !req.body.name || !req.body.descrp) {
      res.status(400).json({ message: 'fields are not proper' });
    }

    const result = await knex.withSchema('cinemabackend').table('moviesdetails').where('id', req.params.id).update(
      {
        name: req.body.name,
        descrp: req.body.descrp,
        releaseddate: req.body.releaseddate,
        movieposter: req.body.movieposter
      }
    )

    if (result) {
      res.json({ message: 'success: updated successfully' });
    }
    else {
      res.json({ message: 'error: movie not found' });
    }
  }
  catch (error) {
    console.log('catch' + error);
    res.status(400);
  }
});




//deleting a existing movie
router.delete('/deletemovie/:id', async (req, res) => {
  try {
    console.log('deleting a particular movie');
    const result = await knex.withSchema('cinemabackend').table('moviesdetails').andWhere('id', req.params.id).andWhere('isactive', true).update({ isactive: false });
    if (result) {
      res.json({ message: 'success: deleted successfully' });
    }
    else {
      res.json({ message: 'error: movie not found' });
    }
  }
  catch (error) {
    console.log('catch' + error);
    res.status(400);
  }
})



// router.get('/getactivemovies', async (req, res) => {
//   try {
//     const result = await knex.withSchema('cinemabackend').table('moviesdetails').where('isactive', true);
//     res.json(result);
//   }
//   catch (error) {
//     console.log('catch' + error);
//     res.status(400);
//   }
// })


// router.get('/getunactivemovies', async (req, res) => {
//   try {
//     const result = await knex.withSchema('cinemabackend').table('moviesdetails').where('isactive', false);
//     res.json(result);
//   }
//   catch (error) {
//     console.log('catch' + error);
//     res.status(400);
//   }
// })


module.exports = router;