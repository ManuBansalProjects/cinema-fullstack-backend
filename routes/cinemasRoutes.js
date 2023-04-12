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
    await knex
      .select('cinemas.id', 'cinemas.name', 'cinemas.address', 'cinemas.contactnumber', 'cinemas.website',
        'cinemas.isactive', 'states.name as state', 'cities.name as city', 'states.id as stateid', 'cities.id as cityid')
      .withSchema('bookmyshow').table('states')
      .join('cinemas', 'states.id', '=', 'cinemas.stateid')
      .join('cities', 'cinemas.cityid', '=', 'cities.id')
      .then(rows => {
        console.log(' rows is',rows);
        const result = rows.map(row => {
          return {
            id: row.id,
            name: row.name,
            address: row.address,
            contactnumber: row.contactnumber,
            website: row.website,
            isactive: row.isactive,
            state: {
              id: row.stateid,
              name: row.state
            },
            city: {
              id: row.cityid,
              name: row.city
            }
          }
        })
        // console.log(result);
        res.json({ result: result });
      })
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
    await knex
      .select('cinemas.id', 'cinemas.name', 'cinemas.contactnumber', 'cinemas.website', 'cinemas.isactive', 'cinemas.address', 'cinemas.stateid',
        'cinemas.cityid', 'states.name as state', 'cities.name as city')
      .withSchema('bookmyshow').table('cinemas').join('states', 'cinemas.stateid', '=', 'states.id')
      .join('cities', 'cinemas.cityid', '=', 'cities.id')
      .where('cinemas.id', req.params.id)
      .then(rows => {
        let cinema = rows.map(row => {
          return {
            id: row.id,
            name: row.name,
            address: row.address,
            contactnumber: row.contactnumber,
            website: row.website,
            isactive: row.isactive,
            state: {
              id: row.stateid,
              name: row.state
            },
            city: {
              id: row.cityid,
              name: row.city
            }
          }
        })
        cinema = cinema[0];
        console.log(cinema);
        res.json({ result: cinema });
      })
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


router.get('/get-states-and-cities', async (req, res) => {
  try {
    console.log('getting states and cities');
    // knex.raw('json_agg(cities.*) as cities')   -> if we want the full data of 2nd table 
    // knex.raw('json_agg(json_build_object(\'id\', cities.id, \'name\', cities.name))  ->if we want some fields of 2nd table data
    await knex.select('states.*', knex.raw('json_agg(json_build_object(\'id\', cities.id, \'name\', cities.name)) as cities'))
      .withSchema('bookmyshow')
      .table('states')
      .join('cities', 'states.id', 'cities.stateid')
      .groupBy('states.id')
      .then(function (states) {
        // The states array will contain objects with the states data and an array of their cities
        for (let i = 0; i < states.length; i++) {
          console.log(states[i]);
        }
        res.json({ result: states });
      });
  }
  catch (error) {
    console.log(error);
  }
})



//middleware-> for token checking
const { tokenChecking } = require('../middlewares/checkingPermissions.js');
const knexnest = require('knexnest');
router.use(tokenChecking);



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
    console.log(req.body, req.params);
    const err = validationResult(req);
    if (!err.isEmpty() || !req.body.name || !req.body.address || !req.body.contactnumber || !req.body.stateid || !req.body.cityid) {
      res.status(400).json({ error: 'please enter correct and proper details' });
    }

    const result = await knex.withSchema('bookmyshow').table('cinemas').where('id', req.params.id).update(
      {
        name: req.body.name,
        address: req.body.address,
        contactnumber: req.body.contactnumber,
        website: req.body.website,
        stateid: req.body.stateid,
        cityid: req.body.cityid
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
router.put('/changecinemastatus/:cinemaid', async (req, res) => {
  try {
    console.log('changing status of a cinema');
    const result = await knex.withSchema('bookmyshow').table('cinemas').where('id', req.params.cinemaid).update({
      isactive: req.body.status ? 1 : 0
    })

    console.log(result);
    res.json({ message: `status changed  ${req.body.status}` });
  }
  catch (error) {
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