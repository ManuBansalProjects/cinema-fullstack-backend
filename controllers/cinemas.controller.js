const cinemasService=require('../services/cinemas.service');

exports.getCinemas=async () => {
    try {
      result=await cinemasService.getCinemas();
      if(!result.length){
        throw 'No Cinemas Found';
      }
      result=result.map(row =>{
        return {
          id: row.id,
          name: row.name,
          address: row.address,
          contactnumber: row.contactnumber,
          website: row.website,
          isactive: row.isactive,
          createdon: row.createdon,
          modifiedon: row.modifiedon,
          state: {
            id: row.stateid,
            name: row.state
          },
          city: {
            id: row.cityid,
            name: row.city
          },
          screens: row.screens
        }
      }) 
      
      return result;
    }
    catch (error) {
      console.log(error);
      throw error;
    }
  }

  exports.getCinema=async (cinemaId) => {
    try {
      result=await cinemasService.getCinema(cinemaId);
      result={
        id: result.id,
        name: result.name,
        address: result.address,
        contactnumber: result.contactnumber,
        website: result.website,
        isactive: result.isactive,
        createdon: result.createdon,
        modifiedon: result.modifiedon,
        state: {
          id: result.stateid,
          name: result.state
        },
        city: {
          id: result.cityid,
          name: result.city
        },
        screens: result.screens
      }
      
      return result;
    }
    catch (error) {
      console.log(error);
      throw error;
    }
  }

  exports.getCinemaIdByName= async (cinemaName) => {
    try {
      id = await cinemasService.getCinemaIdByName(cinemaName);
      return id;
    }
    catch (error) {
      console.log(error);
      throw error;
    }
  }

  exports.getCinemaByName= async (cinemaName) => {
    try {
      result = await cinemasService.getCinemaByName(cinemaName);
      return result;
    }
    catch (error) {
      console.log(error);
      throw error;
    }
  }

  exports.getStatesAndCities=async (req, res) => {
    try {
      result=await cinemasService.getStatesAndCities();
      return result;
    }
    catch (error) {
      console.log(error);
      throw error;
    }
  }

  exports.addCinema=async (cinema) => {
    try {
      newCinema=cinema;
      screens=newCinema.screens;
      delete newCinema.screens;
      await cinemasService.addCinema(newCinema);
  
      if(screens.length){
        lastCinemaId=await cinemasService.getLastCinemaRecordId();  
        screens=screens.map(screen =>{
          return{
            ...screen,
            cinemaid: lastCinemaId
          }
        })
        await cinemasService.addScreens(screens);      
      }

      return {message: 'cinema added succesfully'};
    }
    catch (error) {
      console.log(error);
      throw error;
    }
  }

  exports.editCinema=async (cinemaId, cinema) => {
    try {  
      newCinema=cinema;
      screens=newCinema.screens;
      delete newCinema.screens;
      result1=await cinemasService.editCinema(cinemaId, newCinema);
  
      screens=screens.map(screen =>{
        if(screen.id==0){
          return{
            name: screen.name,
            capacity: screen.capacity,
            hasrecliners: screen.hasrecliners,
            reclinerscapacity: screen.reclinerscapacity,
            cinemaid: req.params.id,
            createdon: new Date()
          }
        }
        else{
          return{
            ...screen,
            cinemaid: req.params.id,
            modifiedon: new Date()
          }
        }
      })
  
      result2=await cinemasService.editScreens(screens);
  
      if (result1 && result2) {
        return { message: 'success: cinema details updated successfully' };
      }
      else {
        return { message: 'error: record not found' };
      }
    }
    catch (error) {
      console.log(error);
      throw error;
    }
  }

  exports.deleteCinema=async (cinemaId) => {
    try {
      result = await cinemasService.deleteCinema(cinemaId);
      if (result) {
        return { message: 'deleted successfully' };
      }
      else {
        return { error: 'cinema not found' };
      }
    }
    catch (error) {
      console.log(error);
      throw error;
    }
  }

  exports.changeCinemaStatus=async (cinemaId, cinemaStatus) => {
    try {
      result=await cinemasService.changeCinemaStatus(cinemaId, cinemaStatus);
      if(result){
        return { message: 'status changed' };
      }
      else{
        return { error: 'not changed' };
      }
    }
    catch (error) {
      console.log(error);
      throw error;
    }
  }

  exports.deleteScreen=async(screenId)=>{
    try{
      result=await cinemasService.deleteScreen(screenId);
      if(result){
        return { message: 'screen deleted' };
      }
      else{
        return { error: 'not deleted' };
      }
    }
    catch(error){
      console.log(error);
      throw error;
    }
  }

  