const express = require('express');
const router = express.Router();


//database pg connection
const { configDb } = require('../config.js');
const knexConfig = configDb.knexPGConfig;
const knex = require('knex')(knexConfig);

//to validate the recieved data
const { body, validationResult } = require('express-validator');










//getting all cinemas
router.get('/getcinemas', async (req, res) => {
  try {
    console.log('listing all the cinemas details');
    let result = await knex.withSchema('bookmyshow').table('cinemas');

    for(let i=0;i<result.length;i++){
      states=await knex.withSchema('bookmyshow').table('states').where('id',result[i].stateid)
      result[i].state=states[0].name;

      cities=await knex.withSchema('bookmyshow').table('cities').where('id',result[i].cityid);
      result[i].city=cities[0].name;
    }

    res.json({ result: result });
  }
  catch (error) {
    console.log(error);
    res.status(400);
  }
});


//getting a particular cinema
router.get('/getcinema/:id', async (req, res) => {
  try {
    console.log('listing a particular cinema details');
    let result = await knex.withSchema('bookmyshow').table('cinemas').where('id', req.params.id);
    result=result[0];

    states=await knex.withSchema('bookmyshow').table('states').where('id',result.stateid);
    result.state=states[0].name;

    cities=await knex.withSchema('bookmyshow').table('cities').where('id',result.cityid);
    result.city=cities[0].name;
    
    res.json({ result: result });
  }
  catch (error) {
    console.log(error);
    res.status(400);
  }
});


//getting cinemaid by cinema name
router.get('/getcinemaidbyname/:cinemaname', async (req, res) => {
  try {
    console.log('sending cinema id by cinema name');
    const result = await knex.withSchema('bookmyshow').table('cinemas').where('name', req.params.cinemaname);
    res.json({ result: result[0].id });
  }
  catch (error) {
    console.log(error);
    res.status(400);
  }
});


//getting cinema by cinema name
router.get('/getcinemabyname/:cinemaname', async (req, res) => {
  try {
    console.log('sending cinema  by cinema name');
    const result = await knex.withSchema('bookmyshow').table('cinemas').where('name', req.params.cinemaname);
    res.json({ result: result[0] });
  }
  catch (error) {
    console.log(error);
    res.status(400);
  }
});



//middleware-> for token checking
const { tokenChecking } = require('../middlewares/checkingPermissions.js');
router.use(tokenChecking);



router.get('/get-states-and-cities', async(req,res)=>{
  try{
    console.log('getting states and cities');
    let states=await knex.withSchema('bookmyshow').table('states');
    console.log(states);
    
    for(let i=0; i<states.length; i++){
      let cities=await knex.withSchema('bookmyshow').table('cities').where('stateid', states[i].id);

      let citiesWithoutStateId=[];
      for(let i=0; i<cities.length; i++){
        citiesWithoutStateId.push({name: cities[i].name, id: cities[i].id});
      }
      console.log(citiesWithoutStateId);

      states[i].cities=citiesWithoutStateId;
    }

    for(let i=0;i<states.length;i++){
      console.log(states[i]);
    }

    res.json({result: states});

  }
  catch(error){
    console.log(error);
  }
})


//adding a new cinema
router.post('/addcinema', async (req, res) => {
  try {
    console.log('adding a new cinema');
    const err = validationResult(req);
    if (!err.isEmpty() || !req.body.name || !req.body.address || !req.body.contactnumber || !req.body.stateid || !req.body.cityid) {
      res.status(400).json({ error: 'please enter correct and proper details' });
    }

    await knex.withSchema('bookmyshow').table('cinemas').insert(req.body);
    res.json({ message: 'cinema added succesfully' });
  }
  catch (error) {
    console.log(error);
    res.status(400);
  }
});




//updating a particular cinema
router.put('/editcinema/:id', async (req, res) => {
  try {
    console.log('updating a cinema details');
    const err = validationResult(req);
    if (!err.isEmpty() || !req.body.name || !req.body.address || !req.body.contactnumber || !req.body.stateid || !req.body.cityid ) {
      res.status(400).json({ error: 'please enter correct and proper details' });
    }

    const result = await knex.withSchema('bookmyshow').table('cinemas').where('id', req.params.id).update(
      {
        name: req.body.name,
        address: req.body.address,
        contactnumber: req.body.contactnumber,
        website: req.body.website,
        stateid: req.body.stateid,
        cityid: req.params.cityid
      }
    )

    if (result) {
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
});




//deleting a particualar cinema
router.delete('/delete/:id', async (req, res) => {
  try {
    console.log('deleting a particular cinema');
    const result = await knex.withSchema('bookmyshow').table('cinemas').where('id', req.params.id).update({ isactive: 0 });
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
})


//changing status of a cinema
router.put('/changecinemastatus/:cinemaid', async(req,res)=>{
  try{
    console.log('changing status of a cinema');
    const result=await knex.withSchema('bookmyshow').table('cinemas').where('id',req.params.cinemaid).update({
      isactive: req.body.status?1:0
    })

    console.log(result);
    res.json({message: `status changed  ${req.body.status}`});
  }
  catch(error){
    console.log(error);
  }
})


// //listing all the cinemas details
// //for both
// router.get('/getactivecinemas', async (req, res) => {
//   try {
//     console.log('listing active cinemas details');
//     const result = await knex.withSchema('cinemabackend').table('cinemasdetails').where('isactive', true);
//     res.json(result);
//   }
//   catch (error) {
//     console.log(error);
//     res.status(400);
//   }
// });


// //for both
// router.get('/getunactivecinemas', async (req, res) => {
//   try {
//     console.log('listing unactive cinemas details');
//     const result = await knex.withSchema('cinemabackend').table('cinemasdetails').where('isactive', false);
//     res.json(result);
//   }
//   catch (error) {
//     console.log(error);
//     res.status(400);
//   }
// });



module.exports = router;