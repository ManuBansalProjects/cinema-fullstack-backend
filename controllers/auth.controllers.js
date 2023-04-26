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


exports.registration=async (user) => {
    try {
      console.log('user is registering');
      const record = await authService.emailAlreadyExists(user.email);
      if (record) {
        throw 'error: Email is already exists';
      }
      else {
        userNew=user;
        //encrypting password
        userNew.password = encryptString(userNew.password, encryptionMethod, key, iv);
        console.log('registering password is ', userNew.password);
        await authService.registration(userNew);
        return { message : 'success: registration successfull'} ;
      }
    }
    catch (error) {
      console.log(error);
      throw error;
    }
}

exports.login=async (user) => {
    try {
      console.log('user is logging in');  
      const record = await authService.emailAlreadyExists(user.email);
      if (!record) {
        throw 'no record found';
      }
      //decrypting stored(hashed) password
      let password = decryptString(record.password, encryptionMethod, key, iv);
      console.log(password);
      //matching incoming and decrypt password
      if (user.password != password) {
        throw 'password not matched';
      }
      else {
        console.log('password matches');
        const token = jwt.sign(record, 'secretkey');
        await authService.login(record.email, token);
        return { login: 'success', token: token};
      }
    }
    catch (error) {
      console.log(error);
      throw error;
    }
}

exports.checkJwtForPasswordChange= async () => {
    try {
      const token = req.headers.authorization.split(' ')[1];

      jwt.verify(token, 'secretkey', (err, decoded) => {
        if (decoded) {
          console.log(decoded);
          return { message: decoded };
        }
        else {
          throw err.message;
        }
      })
    }
    catch (error) {
      console.log(error);
      throw error;
    }
}

exports.changePassword= async (payload, headers) => {
    try {  
      const token = headers.authorization.split(' ')[1];
      jwt.verify(token, 'secretkey', async (err, decoded) => {
        if (decoded) {
          //encrypting password
          encryptedPassword = encryptString(payload.password, encryptionMethod, key, iv);
          await authService.updatePassword(decoded.email, encryptedPassword);
          return { message: 'succesfully updated' };
        }
        else {
          throw err.message;
        }
      })
    }
    catch (error) {
      console.log(error);
      throw error;
    }
}

exports.sendForgotPassordEmail= async (payload) => {
    try {
      console.log('sending forgot-password to user"s email');
      let record = await authService.emailAlreadyExists(payload.email);  
      if (!record) {
        throw 'no email is found';
      }
      else {
        //sending mail notification  
        const newToken = jwt.sign({ email: record.email }, 'secretkey', { expiresIn: "300s" });
        console.log('new token', newToken);
        sendEmailNotification(
          {
            email: record.email,
            subject: "BookMyShow: Here is the link to generate your new password",
            text: `Please Click on the link given below \n http://localhost:4200/users/changepassword/${newToken}   \n \n Link is only valid for 5 minutes`
          },
  
          'forgotPassword'
        );
  
        return {message : 'email has sent'};
      }
    }
    catch (error) {
      console.log(error);
      throw error;
    }
}

exports.getRole= async (headers) => {
    try {
      let temp = headers.authorization.split(' ');
      const token = temp[1];
      record = await authService.getRole(token);
  
      console.log('record is', record);
      console.log(record.role);
      return record.role;
    }
    catch (error) {
      console.log(error);
      throw error;
    }
}

exports.getUsers=async () => {
    try {
      console.log('listing all the users details');
      const result = await authService.getUsers();
      console.log(result);
      return result;
    }
    catch (error) {
      console.log(error);
      throw error;
    }
}

exports.getUser=async (userId) => {
    try {
      console.log('listing a particular user details');
      const result = await authService.getUser(userId);
      return result;
    }
    catch (error) {
      console.log(error);
      throw error;
    }
}

exports.getUserByToken=async (headers) => {
    try {
      let temp = headers.authorization.split(' ');
      const token = temp[1];
      const result = await authService.getUserByToken(token);
      return result;
    }
    catch (error) {
      console.log(error);
      throw error;
    }
}

exports.gettingUserByToken=async (headers) => {
    try {
      let temp = headers.authorization.split(' ');
      const token = temp[1];
      const result = await authService.gettingUserByToken(token);
      return result;
    }
    catch (error) {
      console.log(error);
      throw error;
    }
}

exports.update=async (user, headers) => {
    try {
      console.log('user is updating the details');
      const err = validationResult(req);
      if (!err.isEmpty()) {
        throw 'please enter correct details';
      }
      let temp = headers.authorization.split(' ');
      const token = temp[1];
      
      await authService.updateUser(token, user);
      return { message: 'succesfully updated' };
    }
    catch (error) {
      console.log(error);
      throw error;
    }
}

exports.logOut= async (headers) => {
    try {
      console.log('user is logging out');
      let temp = headers.authorization.split(' ');
      const token = temp[1];
      await authService.logOut(token);
      return { message: 'you are successfully logged out' };
    }
    catch (error) {
      console.log(error);
      throw error;
    }
}

exports.delete=async (userId) => {
    try {
      console.log('deleting a particular');
      await authService.delete(userId);
      return { message: 'deleted successfully' };
    }
    catch (error) {
      console.log(error);
      throw error;
    }
}

exports.sendUpdatePasswordLink=async (headers) => {
    try {
      let temp = headers.authorization.split(' ');
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
  
      return { message: 'email has sent' };
    }
    catch (error) {
      console.log(error);
      throw error;
    }  
}




