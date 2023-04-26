const moviesService=require('../services/movies.service');

exports.getMovies=async() => {
    try {
      const result = await moviesService.getMovies();
      console.log(result);
      if(!result.length){
        throw 'No Movies Found';
      }
      return result;
    }
    catch (error) {
      console.log(error);
      throw error;
    }
}

exports.getMovie= async (movieId) => {
    try {
      console.log('listing a particular movie details');
      const result = await moviesService.getMovie(movieId);
      console.log(result);
      return result;
    }
    catch (error) {
      console.log(error);
      throw error;
    }
}

exports.getMovieIdByName=async (movieName) => {
    try {
      console.log('getting a movieid by  movie name');
      const result = await moviesService.getMovieIdByName(movieName);
      console.log(result);
      return result;
    }
    catch (error) {
      console.log(error);
      throw error;
    }
}

exports.addMovie=async (movie) => {
    try {
      console.log('adding a movie');
      await moviesService.addMovie(movie);
      return { message: 'movie is inserted successfully' };
    }
    catch (error) {
      console.log(error);
      throw error;
    }
}

exports.editMovie=async (movieId, movie) => {
    try {
      console.log('editing a movie' , movieId);  
      const result = await moviesService.editMovie(movieId, movie);
      if (result) {
        return { message: 'success: updated successfully' };
      }
      else {
        return { error: 'error: movie not found' };
      }
    }
    catch (error) {
      console.log(error);
      throw error;
    }
}

exports.deleteMovie= async (movieId) => {
    try {
      console.log('deleting a particular movie');
      const result = await moviesService.deleteMovie(movieId);
      if (result) {
        return { message: 'success: movie deleted successfully' };
      }
      else {
        return { error: 'error: movie not found' };
      }
    }
    catch (error) {
      console.log(error);
      throw error;
    }
}