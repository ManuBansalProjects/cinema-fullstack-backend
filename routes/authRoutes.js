const express = require('express');
const router = express.Router();



//to validate the incoming data like: email,password,etc.
const { body, validationResult } = require('express-validator');


//database pg connection
const { configDb } = require('../config.js');
const knexConfig = configDb.knexPGConfig;
const knex = require('knex')(knexConfig);


//to generate the token for security purposes
const jwt = require('jsonwebtoken');


//to send Email
const { sendEmailNotification } = require('../utility/util.js');




//to hash the password using crypto
let Crypto = require('crypto');  //importing crypto module
let secret_key = 'fd85b494-aaaa';  //defining secret key
let secret_iv = 'smslt'; //defining secret IV
let encryptionMethod = 'AES-256-CBC'; //this is our encryption method
let key = Crypto.createHash('sha512').update(secret_key, 'utf-8').digest('hex').substring(0, 32); //create key
let iv = Crypto.createHash('sha512').update(secret_iv, 'utf-8').digest('hex').substring(0, 16); //same create iv using 'sha512'


//call the encrypt like-> encryptString('manu bansal', encryptionMethod, key, iv)
function encryptString(plain_text, encryptionMethod, secret, iv) {
  let encryptor = Crypto.createCipheriv(encryptionMethod, secret, iv); //encrypt using AES-256-CBC
  let aes_encrypted = encryptor.update(plain_text, 'utf8', 'base64') + encryptor.final('base64'); //convert to base64
  return Buffer.from(aes_encrypted).toString('base64');  //return encrypted string
}


//call the decrypt like-> decryptString('manu bansal', encryptionMethod, key, iv)
function decryptString(encryptedString, encryptionMethod, secret, iv) {
  const buff = Buffer.from(encryptedString, 'base64'); //get base64 string
  encryptedString = buff.toString('utf-8'); // convert to string
  let decryptor = Crypto.createDecipheriv(encryptionMethod, secret, iv);
  return decryptor.update(encryptedString, 'base64', 'utf8') + decryptor.final('utf8'); //return decrypt stirng
}




//user-registration
router.post('/registration', body('name').isLength({ min: 3 }), body('email').isEmail(), body('password').isLength({ min: 8 }), async (req, res) => {
  try {
    console.log('user is registering');

    const err = validationResult(req);
    if (!err.isEmpty()) {
      res.status(400).json({ error: 'error accured: credentials are not valid' });
    }

    const alreadyExists = await knex.withSchema('bookmyshow').table('users').where('email', req.body.email);

    if (alreadyExists.length) {
      res.json({ error: 'error: Email is already exists' });
    }
    else {
      //encrypting password
      req.body.password = encryptString(req.body.password, encryptionMethod, key, iv);
      console.log('registering password is ', req.body.password);

      await knex.withSchema('bookmyshow').table('users').insert(req.body);
      res.json({ message: 'success: registration successfull' });
    }
  }
  catch (error) {
    console.log('catch', error);
    res.status(400);
  }
})



//login-> token generation
router.post('/login', body('email').isEmail(), body('password').isLength({ min: 8 }), async (req, res) => {
  try {
    console.log('user is logging in');
    const err = validationResult(req);
    if (!err.isEmpty()) {
      res.status(400).json({ error: 'error accured' });
    }

    const record = await knex.withSchema('bookmyshow').table('users').andWhere('email', req.body.email);
    console.log(record);
    if (!record.length) {
      res.json({ error: ' no record found' });
    }

    //decrypting stored(hashed) password
    let password = decryptString(record[0].password, encryptionMethod, key, iv);
    console.log(password);

    //matching incoming and decrypt password
    if (req.body.password != password) {
      res.json({ error: 'password not matched' });
    }
    else {
      console.log('password matches');
      const token = jwt.sign(record[0], 'secretkey');
      await knex.withSchema('bookmyshow').table('users').andWhere('email', req.body.email).update({ jwt: token });
      res.json({ login: 'success', token: token, role: record[0].role });
    }
  }
  catch (error) {
    console.log('catch', error);
    res.status(400);
  }
})


router.get('/checkjwtforpasswordchange', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];

    jwt.verify(token, 'secretkey', (err, decoded) => {
      if (decoded != undefined) {
        console.log(decoded);
        res.json({ message: decoded });
      }
      else {
        console.log(err);
        res.json({ error: err });
      }
    })
  }
  catch (error) {
    console.log(error);
  }
})



router.put('/changepassword', body('password').isLength({ min: 8 }), async (req, res) => {
  try {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      res.status(400).json({ error: 'error accured' });
    }


    const token = req.headers.authorization.split(' ')[1];

    jwt.verify(token, 'secretkey', async (err, decoded) => {
      if (decoded != undefined) {

        //encrypting password
        req.body.password = encryptString(req.body.password, encryptionMethod, key, iv);

        await knex.withSchema('bookmyshow').table('users').where('email', decoded.email).update({
          password: req.body.password
        })

        res.json({ message: 'succesfully updated' });

      }
      else {
        console.log(err);
        res.json({ error: err.message });
      }
    })

  }
  catch (error) {
    console.log(error);
  }

})



//sending forgot password email to user
router.post('/sendforgotpasswordemail', body('email').isEmail(), async (req, res) => {
  try {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      res.status(400).json({ error: 'error accured' });
    }


    console.log('sending forgot-password to user"s email', req.body.email);

    let result = await knex.withSchema('bookmyshow').table('users').where('email', req.body.email);
    console.log(result);

    if (!result.length) {
      res.json({ error: 'no email is found' });
    }
    else {
      //sending mail notification
      result = result[0];

      const newToken = jwt.sign({ email: result.email }, 'secretkey', { expiresIn: "300s" });
      console.log('new token', newToken);

      sendEmailNotification(
        {
          email: result.email,
          subject: "BookMyShow: Here is the link to generate your new password",
          text: `Please Click on the link given below \n http://localhost:4200/users/changepassword/${newToken}   \n \n Link is only valid for 5 minutes`
        },

        'forgotPassword'
      );

      res.json({ message: 'email has sent' });

    }
  }
  catch (error) {
    console.log(error);
    res.json({ error: `catch ${error}` });
  }
})




//middleware-> for token checking
const { tokenChecking, adminChecking, adminAndSelfUserAccess, selfAccess } = require('../middlewares/checkingPermissions');
router.use(tokenChecking);



//returning role to the frontend
router.get('/getrole', async (req, res) => {
  try {
    let temp = req.headers.authorization.split(' ');
    const token = temp[1];
    record = await knex.withSchema('bookmyshow').table('users').where('jwt', token);

    console.log('record is', record[0]);
    console.log(record[0].role);

    res.json({ role: record[0].role });
  }
  catch (error) {
    console.log('catch', error);
    res.status(400);
  }
})



//getting all users
router.get('/getusers', adminChecking, async (req, res) => {
  try {
    console.log('listing all the users details');
    const result = await knex.withSchema('bookmyshow').table('users').where('isactive', 1);
    console.log(result);
    res.json({ result: result });
  }
  catch (error) {
    console.log(error);
    res.status(400);
  }
});



//getting a particular user
router.get('/getuser/:id', adminAndSelfUserAccess, async (req, res) => {
  try {
    console.log('listing a particular user details');
    const result = await knex.withSchema('bookmyshow').table('users').where('id', req.params.id);
    res.json({ result: result[0] });
  }
  catch (error) {
    console.log(error);
    res.status(400);
  }
});


//getting a particualr user by token
router.get('/getuserbytoken', async (req, res) => {
  try {
    let temp = req.headers.authorization.split(' ');
    const token = temp[1];
    const result = await knex.withSchema('bookmyshow').table('users').where('jwt', token);
    res.json({ result: result });
  }
  catch (error) {
    console.log(error);
    res.status(400);
  }
});

//getting a particualr user by token
router.get('/gettinguserbytoken', async (req, res) => {
  try {
    let temp = req.headers.authorization.split(' ');
    const token = temp[1];
    const result = await knex.withSchema('bookmyshow').table('users').where('jwt', token);
    res.json({ result: result[0] });
  }
  catch (error) {
    console.log(error);
    res.status(400);
  }
});




//updating  a particular user
router.put('/update', body('name').isLength({ min: 3 }), async (req, res) => {
  try {
    console.log('user is updating the details');
    const err = validationResult(req);
    if (!err.isEmpty()) {
      res.status(404).json('please enter correct details');
    }
    let temp = req.headers.authorization.split(' ');
    const token = temp[1];

    await knex.withSchema('bookmyshow').table('users').where('jwt', token).update(
      {
        name: req.body.name,
      }
    )
    res.json({ message: 'succesfully updated' });

  }
  catch (error) {
    console.log("catch", error);
    res.status(400);
  }
});



//logout
router.get('/logout', async (req, res) => {
  try {
    console.log('user is logging out');

    let temp = req.headers.authorization.split(' ');
    const token = temp[1];

    const result = await knex.withSchema('bookmyshow').table('users').where('jwt', token).update({ jwt: null });
    res.json({ message: 'you are successfully logged out' });
  }
  catch (error) {
    console.log('catch', error);
    res.status(400);
  }
});



//deleting a particular user (soft-delete => isactive=0)
router.delete('/delete/:id', adminAndSelfUserAccess, async (req, res) => {
  try {
    console.log('deleting a particular user id:', req.params.id);
    const result = await knex.withSchema('bookmyshow').table('users').andWhere('id', req.params.id).update({ isactive: 0 });
    res.json({ message: 'deleted successfully' });
  }
  catch (error) {
    console.log('catch', error);
    res.status(400);
  }
})




//sending reset password link to user
//changing password 
router.get('/sendupdatepasswordlink', async (req, res) => {
  try {
    console.log('changing passsword', req.headers);

    let temp = req.headers.authorization.split(' ');
    const token = temp[1];

    let result = await knex.withSchema('bookmyshow').table('users').where('jwt', token); result = result[0];

    const newToken = jwt.sign({ email: result.email }, 'secretkey', { expiresIn: "300s" });
    console.log('new token', newToken);


    sendEmailNotification(
      {
        email: result.email,
        subject: "BookMyShow: Here is the Link to change your password",
        text: `Please Click on the link given below \n http://localhost:4200/users/changepassword/${newToken}   \n \n Link is only valid for 5 minutes`
      },

      'resetPassword'
    );

    // console.log(obj);
    res.json({ message: 'email has sent' });

  }
  catch (error) {
    console.log('catch ', error);
  }

})




// //getAlldata--------------this is only for testing purpose
// //for admin
// router.get('/activeusers', async (req, res) => {
//   try {
//     console.log('listing all the active users details');
//     const result = await knex.withSchema('cinemabackend').table('usersdetails').where('isactive', true);
//     res.json(result);
//   }
//   catch (error) {
//     console.log(error);
//     res.status(400);
//   }
// });



// //for admin
// router.get('/unactiveusers', async (req, res) => {
//   try {
//     console.log('listing all the unactive users details');
//     const result = await knex.withSchema('cinemabackend').table('usersdetails').where('isactive', false);
//     res.json(result);
//   }
//   catch (error) {
//     console.log(error);
//     res.status(400);
//   }
// });


module.exports = router;