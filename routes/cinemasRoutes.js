const express = require('express');
const router = express.Router();
const cinemasControllers=require('../controllers/cinemas.controller');


router.get('/getcinemas', cinemasControllers.getCinemas);
router.get('/getcinema/:id', cinemasControllers.getCinema);
router.get('/getcinemaidbyname/:cinemaname', cinemasControllers.getCinemaIdByName);
router.get('/getcinemabyname/:cinemaname', cinemasControllers.getCinemaByName);
router.get('/get-states-and-cities', cinemasControllers.getStatesAndCities);

//middleware-> for token checking
const { tokenChecking } = require('../middlewares/checkingPermissions.js');
router.use(tokenChecking);

router.post('/addcinema', cinemasControllers.addCinema);
router.put('/editcinema/:id', cinemasControllers.editCinema );
router.delete('/delete/:id', cinemasControllers.deleteCinema);
router.put('/changecinemastatus/:cinemaid', cinemasControllers.changeCinemaStatus);
router.delete('/delete-screen/:screenid', cinemasControllers.deleteScreen);

module.exports = router;






















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



