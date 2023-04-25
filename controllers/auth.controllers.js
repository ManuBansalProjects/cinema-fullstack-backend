//to validate the incoming data like: email,password,etc.
const { body, validationResult } = require('express-validator');
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

const authService=require('../services/auth.service.js');


exports.registration=(body('name').isLength({ min: 3 }), body('email').isEmail(), body('password').isLength({ min: 8 }), async (req, res) => {
    try {
      console.log('user is registering');
      const err = validationResult(req);
      if (!err.isEmpty()) {
        res.status(400).json({ error: 'error accured: credentials are not valid' });
      }
  
      const record = await authService.emailAlreadyExists(req.body.email);
      if (record) {
        res.json({ error: 'error: Email is already exists' });
      }
      else {
        //encrypting password
        req.body.password = encryptString(req.body.password, encryptionMethod, key, iv);
        console.log('registering password is ', req.body.password);
  
        await authService.registration(req.body);
        res.json({ message: 'success: registration successfull' });
      }
    }
    catch (error) {
      console.log('catch', error);
      res.status(400);
    }
})

exports.login=(body('email').isEmail(), body('password').isLength({ min: 8 }), async (req, res) => {
    try {
      console.log('user is logging in');
      const err = validationResult(req);
      if (!err.isEmpty()) {
        res.status(400).json({ error: 'error accured' });
      }
  
      const record = await authService.emailAlreadyExists(req.body.email);
      if (!record) {
        res.json({ error: 'no record found' });
      }
  
      //decrypting stored(hashed) password
      let password = decryptString(record.password, encryptionMethod, key, iv);
      console.log(password);
  
      //matching incoming and decrypt password
      if (req.body.password != password) {
        res.json({ error: 'password not matched' });
      }
      else {
        console.log('password matches');
        const token = jwt.sign(record, 'secretkey');
        await authService.login(req.body.email, token);
        res.json({ login: 'success', token: token});
      }
    }
    catch (error) {
      console.log('catch', error);
      res.status(400);
    }
})

exports.checkJwtForPasswordChange= async (req, res) => {
    try {
      const token = req.headers.authorization.split(' ')[1];
  
      jwt.verify(token, 'secretkey', (err, decoded) => {
        if (decoded) {
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
}

exports.changePassword= (body('password').isLength({ min: 8 }), async (req, res) => {
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

          await authService.updatePassword(decoded.email, req.body.password);
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

exports.sendForgotPassordEmail= (body('email').isEmail(), async (req, res) => {
    try {
      const err = validationResult(req);
      if (!err.isEmpty()) {
        res.status(400).json({ error: 'error accured' });
      }

      console.log('sending forgot-password to user"s email', req.body.email);
  
      let record = await authService.emailAlreadyExists(req.body.email);  
      if (!record) {
        res.json({ error: 'no email is found' });
      }
      else {
        //sending mail notification  
        const newToken = jwt.sign({ email: req.body.email }, 'secretkey', { expiresIn: "300s" });
        console.log('new token', newToken);
  
        sendEmailNotification(
          {
            email: req.body.email,
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

exports.getRole= async (req, res) => {
    try {
      let temp = req.headers.authorization.split(' ');
      const token = temp[1];
      record = await authService.getRole(token);
  
      console.log('record is', record);
      console.log(record.role);
  
      res.json({ role: record.role });
    }
    catch (error) {
      console.log('catch', error);
      res.status(400);
    }
}

exports.getUsers=async (req, res) => {
    try {
      console.log('listing all the users details');
      const result = await authService.getUsers();
      console.log(result);
      res.json({ result: result });
    }
    catch (error) {
      console.log(error);
      res.status(400);
    }
}

exports.getUser=async (req, res) => {
    try {
      console.log('listing a particular user details');
      const result = await authService.getUser(req.params.id);
      res.json({ result: result });
    }
    catch (error) {
      console.log(error);
      res.status(400);
    }
}

exports.getUserByToken=async (req, res) => {
    try {
      let temp = req.headers.authorization.split(' ');
      const token = temp[1];
      const result = await authService.getUserByToken(token);
      res.json({ result: result });
    }
    catch (error) {
      console.log(error);
      res.status(400);
    }
}

exports.gettingUserByToken=async (req, res) => {
    try {
      let temp = req.headers.authorization.split(' ');
      const token = temp[1];
      const result = await authService.gettingUserByToken(token);
      res.json({ result: result });
    }
    catch (error) {
      console.log(error);
      res.status(400);
    }
}

exports.update=(body('name').isLength({ min: 3 }), async (req, res) => {
    try {
      console.log('user is updating the details');
      const err = validationResult(req);
      if (!err.isEmpty()) {
        res.status(404).json('please enter correct details');
      }
      let temp = req.headers.authorization.split(' ');
      const token = temp[1];
      
      await authService.updateUser(token, req.body);
      res.json({ message: 'succesfully updated' });
    }
    catch (error) {
      console.log("catch", error);
      res.status(400);
    }
})

exports.logOut= async (req, res) => {
    try {
      console.log('user is logging out');
      let temp = req.headers.authorization.split(' ');
      const token = temp[1];
      await authService.logOut(token);
      res.json({ message: 'you are successfully logged out' });
    }
    catch (error) {
      console.log('catch', error);
      res.status(400);
    }
}

exports.delete=async (req, res) => {
    try {
      console.log('deleting a particular user id:', req.params.id);
      const result = await authService.delete(req.params.id);
      res.json({ message: 'deleted successfully' });
    }
    catch (error) {
      console.log('catch', error);
      res.status(400);
    }
}

exports.sendUpdatePasswordLink=async (req, res) => {
    try {
      console.log('changing passsword', req.headers);
  
      let temp = req.headers.authorization.split(' ');
      const token = temp[1];
  
      let result = await authService.gettingUserByToken(token);
  
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
  
      res.json({ message: 'email has sent' });
    }
    catch (error) {
      console.log('catch ', error);
    }
  
}




