const express = require('express');
const router = express.Router();

//to validate the data
const { body, validationResult } = require('express-validator');


//database pg connection
const { configDb } = require('../config.js');
const knexConfig = configDb.knexPGConfig;
const knex = require('knex')(knexConfig);




//requiring middleware
const { tokenChecking, adminAndSelfUserAccess } = require('../middlewares/checkingPermissions.js');
router.use(tokenChecking);






//a new booking
router.post('/booktickets/:email', body('userid').isInt(), body('cinemaid').isInt(), body('movieid').isInt(), body('showid').isInt(), body('amount').isInt(), async (req, res) => {
  try {
    console.log('booking tickets backend');
    const err = validationResult(req);
    if (!err.isEmpty()) {
      res.status(400).json('please enter proper details');
    }
    await knex.withSchema('cinemabackend').table('bookings').insert(req.body);
    // res.json('successfully booked');



    //sending booking details to the customer's email

    // let customer = await knex.withSchema('cinemabackend').table('usersdetails').where('id', req.body.userid); customer = customer[0];
    // let movie = await knex.withSchema('cinemabackend').table('moviesdetails').where('id', req.body.movieid); movie = movie[0];
    // let cinema = await knex.withSchema('cinemabackend').table('cinemasdetails').where('id', req.body.cinemaid); cinema = cinema[0];
    // let bookingid = await knex.withSchema('cinemabackend').table('bookings').select('*'); bookingid = bookingid.length;

    console.log(req.body);

    let details = {
      from: "manubansal.cse23@jecrc.ac.in",
      to: req.params.email,
      subject: "cinema ticket booked succesfully",
      // text: `BookingId:- ${bookingid}  \n  CustomerName:- ${customer.name}  \n  CustomerEmail:- ${customer.email}  \n  MovieName:- ${movie.name}  \n  ReleasedDate:- ${movie.releaseddate}  \n  CinemaName:- ${cinema.name}  \n  CinemaMobileNumber:- ${cinema.mobile}  \n  CinemaAddress:- ${cinema.address}  \n  City:- ${cinema.city}  \n  ScrreningTime:- ${req.body.screeningtime}  \n  SeatNumber:- ${req.body.seatnumber}  \n  BookedAmount:- ${req.body.amount}  \n PLEASE DON't SHARE THIS MOVIE TICKET WITH UNKNOWN PERSON  \n Thankyou for Ticket Booking `
      text: "ticket success"
    }



    //sending mail notification

    const { configMailTransporter } = require('../config.js');

    configMailTransporter.sendMail(details, (err) => {
      if (err) {
        console.log("it has an error", err);
        res.json(err);
      }
      else {
        console.log('email has sent');
        res.json({ message: 'success: email has sent' });
      }
    });

  }
  catch (error) {
    console.log(error);
    res.status(400);
  }
});




router.get('/getbookinghistory/:userid', adminAndSelfUserAccess, async (req, res) => {
  try {
    const result = await knex.withSchema('cinemabackend').table('bookings').where('userid', req.params.userid);
    res.json({ result: result });
  }
  catch (error) {
    console.log(error);
    res.status(400);
  }
});




// router.get('/',  async (req, res) => {
//   try {
//     const result = await knex.withSchema('cinemabackend').table('bookings').select('*');
//     res.json(result);
//   }
//   catch (error) {
//     console.log(error);
//     res.status(400);
//   }
// });


module.exports = router;