const express = require('express');
const router = express.Router();
const moviesControllers=require('../controllers/movies.controller');

router.get('/getmovies', moviesControllers.getMovies);
router.get('/getmovie/:id', moviesControllers.getMovie);
router.get('/getmovieidbyname/:moviename', moviesControllers.getMovieIdByName);

//requiring middleware for token checking
const { tokenChecking } = require('../middlewares/checkingPermissions.js');
router.use(tokenChecking);

router.post('/addmovie', moviesControllers.addMovie);
router.put('/editmovie/:id', moviesControllers.editMovie);
router.delete('/deletemovie/:id', moviesControllers.deleteMovie);



module.exports = router;