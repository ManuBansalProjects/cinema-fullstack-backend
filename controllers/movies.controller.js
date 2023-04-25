//validating data
const { body, validationResult } = require('express-validator');
const moviesService=require('../services/movies.service');

exports.getMovies=async (req, res) => {
    try {
      const result = await moviesService.getMovies();
      console.log(result);
      res.json({ moviesList: result });
    }
    catch (error) {
      console.log('catch' + error);
      res.status(400);
    }
}

exports.getMovie= async (req, res) => {
    try {
      console.log('listing a particular movie details');
      const result = await moviesService.getMovie(req.params.id);
      console.log(result);
      res.json({ result: result });
    }
    catch (error) {
      console.log('catch' + error);
      res.status(400);
    }
}

exports.getMovieIdByName=async (req, res) => {
    try {
      console.log('getting a movieid by  movie name');
      const result = await moviesService.getMovieIdByName(req.params.moviename);
      console.log(result);
      res.json({ result: result });
    }
    catch (error) {
      console.log('catch' + error);
      res.status(400);
    }
}

exports.addMovie=(body('releaseddate').isDate(), async (req, res) => {
    try {
      console.log('adding a movie');
      const err = validationResult(req);
      if (!err.isEmpty() || !req.body.name || !req.body.descrption || !req.body.movieposter) {
        res.status(400).json({ message: 'fields are not proper' });
      }
  
      const result=await moviesService.addMovie(req.body);
      res.json({ message: 'movie is inserted successfully' });
    }
    catch (error) {
      console.log('catch' + error);
      res.status(400);
    }
})

exports.editMovie=(body('releaseddate').isDate(), async (req, res) => {
    try {
      console.log('editing a movie' , req.params);
      const err = validationResult(req);
      if (!err.isEmpty() || !req.body.name || !req.body.descrption || !req.body.movieposter) {
        res.status(400).json({ message: 'fields are not proper' });
      }
  
      const result = await moviesService.editMovie(req.params.id, req.body);
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
})

exports.deleteMovie= async (req, res) => {
    try {
      console.log('deleting a particular movie');
      const result = await moviesService.deleteMovie(req.params.id);
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
}