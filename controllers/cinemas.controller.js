const cinemasService=require('../services/cinemas.service');
//to validate the recieved data
const { body, validationResult } = require('express-validator');

exports.getCinemas=async (req, res) => {
    try {
      result=await cinemasService.getCinemas();
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
      
      res.json({ result: result });  
    }
    catch (error) {
      console.log(error);
      res.status(400);
    }
  }

  exports.getCinema=async (req, res) => {
    try {
      result=await cinemasService.getCinema(req.params.id);
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
      
      res.json({ result: result });  
    }
    catch (error) {
      console.log(error);
      res.status(400);
    }
  }

  exports.getCinemaIdByName= async (req, res) => {
    try {
      id = await cinemasService.getCinemaIdByName(req.params.cinemaname);
      res.json({ result: id });
    }
    catch (error) {
      console.log(error);
      res.status(400);
    }
  }

  exports.getCinemaByName= async (req, res) => {
    try {
      result = await cinemasService.getCinemaByName(req.params.cinemaname);
      res.json({ result: result });
    }
    catch (error) {
      console.log(error);
      res.status(400);
    }
  }

  exports.getStatesAndCities=async (req, res) => {
    try {
      result=await cinemasService.getStatesAndCities();
      console.log('controllers', result);
      res.json({ result: result });
    }
    catch (error) {
      console.log(error);
    }
  }

  exports.addCinema=async (req, res) => {
    try {
      const err = validationResult(req);
      if (!err.isEmpty() || !req.body.name || !req.body.address || !req.body.contactnumber || !req.body.stateid || !req.body.cityid) {
        res.status(400).json({ error: 'please enter correct and proper details' });
      }
  
      screens=req.body.screens;
      delete req.body.screens;
      await cinemasService.addCinema(req.body);
  
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

      res.json({ message: 'cinema added succesfully' });
    }
    catch (error) {
      console.log(error);
      res.status(400);
    }
  }

  exports.editCinema=async (req, res) => {
    try {  
      const err = validationResult(req);
      if (!err.isEmpty() || !req.body.name || !req.body.address || !req.body.contactnumber || !req.body.stateid || !req.body.cityid) {
        res.status(400).json({ error: 'please enter correct and proper details' });
      }
  
      screens=req.body.screens;
      delete req.body.screens;
      result1=await cinemasService.editCinema(req.params.id,req.body);
  
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
        res.json({ message: 'success: cinema details updated succesfully' });
      }
      else {
        res.json({ message: 'error: record not found' });
      }
    }
    catch (error) {
      console.log(error);
      res.status(400);
    }
  }

  exports.deleteCinema=async (req, res) => {
    try {
      result = await cinemasService.deleteCinema(req.params.id);

      if (result) {
        res.json({ message: 'deleted successfully' });
      }
      else {
        res.json({ error: 'cinema not found' });
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  exports.changeCinemaStatus=async (req, res) => {
    try {
      await cinemasService.changeCinemaStatus(req.params.cinemaid, req.body.status);
      res.json({ message: 'status changed' });
    }
    catch (error) {
      console.log(error);
    }
  }

  exports.deleteScreen=async(req,res)=>{
    try{
      await cinemasService.deleteScreen(req.params.screenid);
    }
    catch(error){
      console.log(error);
    }
  }

  