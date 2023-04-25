//database pg connection
const { configDb } = require('../config.js');
const knexConfig = configDb.knexPGConfig;
const knex = require('knex')(knexConfig);

exports.getMovies=async () => {
    try {
      const result = await knex.withSchema('bookmyshow').table('movies').where('isactive', 1);
      return result;
    }
    catch (error) {
      console.log('catch' + error);
      res.status(400);
    }
}

exports.getMovie= async (movieid) => {
    try {
      const result = await knex.withSchema('bookmyshow').table('movies').where('id', movieid);
      return result[0];
    }
    catch (error) {
      console.log('catch' + error);
      res.status(400);
    }
}

exports.getMovieIdByName=async (moviename) => {
    try {
      const result = await knex.withSchema('bookmyshow').table('movies').where('name', moviename);
      return result[0].id;
    }
    catch (error) {
      console.log('catch' + error);
      res.status(400);
    }
}

exports.addMovie= async (movie) => {
    try {
      return await knex.withSchema('bookmyshow').table('movies').insert(movie);  
    }
    catch (error) {
      console.log('catch' + error);
      res.status(400);
    }
}

exports.editMovie= async (movieid, movie) => {
    try {
      return result = await knex.withSchema('bookmyshow').table('movies').where('id', movieid).update(
        {
          name: movie.name,
          descrption: movie.descrption,
          releaseddate: movie.releaseddate,
          movieposter: movie.movieposter
        }
      )
  
    }
    catch (error) {
      console.log('catch' + error);
      res.status(400);
    }
}

exports.deleteMovie= async (movieid) => {
    try {
      return result = await knex.withSchema('bookmyshow').table('movies').andWhere('id', movieid).update({ isactive: 0 });
    }
    catch (error) {
      console.log('catch' + error);
      res.status(400);
    }
}