//database pg connection
const { configDb } = require('../config.js');
const knexConfig = configDb.knexPGConfig;
const knex = require('knex')(knexConfig);

exports.emailAlreadyExists=async (email)=>{
    try{
        const result=await knex.withSchema('bookmyshow').table('users').where('email', email);
        return result[0];
    }
    catch(error){
        console.log(error);
        throw error;
    }
}

exports.registration=async (user)=>{
    try{
        await knex.withSchema('bookmyshow').table('users').insert(user);
    }
    catch(error){
        console.log(error);
        throw error;
    }
}

exports.login=async (email, token)=>{
    try{
        await knex.withSchema('bookmyshow').table('users').andWhere('email', email).update({ jwt: token });
    }
    catch(error){
        console.log(error);
        throw error;
    }
}

exports.updatePassword=async (email,password)=>{
    try{
        await knex.withSchema('bookmyshow').table('users').where('email', email).update({password: password});
    }
    catch(error){
        console.log(error);
        throw error;
    }
}

exports.getRole=async (token)=>{
    try{
        record = await knex.withSchema('bookmyshow').table('users').where('jwt', token);
        return record[0];
    }
    catch(error){
        console.log(error);
        throw error;
    }
}

exports.getUsers=async()=>{
    try{
        return await knex.withSchema('bookmyshow').table('users').where('isactive', 1);
    }
    catch(error){
        console.log(error);
        throw error;
    }
}

exports.getUser=async(userid)=>{
    try{
        result=await knex.withSchema('bookmyshow').table('users').where('id', userid);
        return result[0];
    }
    catch(error){
        console.log(error);
        throw error;
    }
}

exports.getUserByToken=async (token) => {
    try {
      return await knex.withSchema('bookmyshow').table('users').where('jwt', token);
    }
    catch (error) {
      console.log(error);
      throw error;
    }
}

exports.gettingUserByToken=async (token) => {
    try {
      result= await knex.withSchema('bookmyshow').table('users').where('jwt', token);
      return result[0];
    }
    catch (error) {
      console.log(error);
      throw error;
    }
}

exports.updateUser=async (token,userDetails)=>{
    try{
        await knex.withSchema('bookmyshow').table('users').where('jwt', token).update(
            {
              name: userDetails.name,
            }
        )
    }
    catch(error){
        console.log(error);
        throw error;
    }
}

exports.logOut=async(token)=>{
    try{
        await knex.withSchema('bookmyshow').table('users').where('jwt', token).update({ jwt: null });
    }
    catch(error){
        console.log(error);
        throw error;
    }
}


exports.delete=async (userid) => {
    try {
      await knex.withSchema('bookmyshow').table('users').andWhere('id', userid).update({ isactive: 0 });
    }
    catch (error) {
      console.log(error);
      throw error;
    }
}