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
      console.log(error);
      throw error;
    }
}

exports.getMovie= async (movieId) => {
    try {
      const result = await knex.withSchema('bookmyshow').table('movies').where('id', movieId);
      return result[0];
    }
    catch (error) {
      console.log(error);
      throw error;
    }
}

exports.getMovieIdByName=async (movieName) => {
    try {
      const result = await knex.withSchema('bookmyshow').table('movies').where('name', movieName);
      return result[0].id;
    }
    catch (error) {
      console.log(error);
      throw error;
    }
}

exports.addMovie= async (movie) => {
    try {
      const result= await knex.withSchema('bookmyshow').table('movies').insert(movie);  
      return result;
    }
    catch (error) {
      console.log(error);
      throw error;
    }
}

exports.editMovie= async (movieId, movie) => {
    try {
      const result = await knex.withSchema('bookmyshow').table('movies').where('id', movieId).update(
        {
          name: movie.name,
          descrption: movie.descrption,
          releaseddate: movie.releaseddate,
          movieposter: movie.movieposter
        }
      )
      return result;
    }
    catch (error) {
      console.log(error);
      throw error;
    }
}

exports.deleteMovie= async (movieId) => {
    try {
      const result = await knex.withSchema('bookmyshow').table('movies').andWhere('id', movieId).update({ isactive: 0 });
      return result;
    }
    catch (error) {
      console.log(error);
      throw error;
    }
}