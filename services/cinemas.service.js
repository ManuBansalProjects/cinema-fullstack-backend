//database pg connection
const { configDb } = require('../config.js');
const knexConfig = configDb.knexPGConfig;
const knex = require('knex')(knexConfig);

exports.getCinemas=async()=>{
    try{
        console.log('listing all the cinemas details');
        result=await knex
        .select('cinemas.id', 'cinemas.name', 'cinemas.address', 'cinemas.contactnumber', 'cinemas.website','cinemas.isactive', 
        'cinemas.createdon','cinemas.modifiedon','states.id as stateid', 'states.name as state','cities.id as cityid', 'cities.name as city', 
        knex.raw('json_agg(json_build_object(\'id\', screens.id, \'name\', screens.name, \'capacity\', screens.capacity, \'hasrecliners\', screens.hasrecliners, \'reclinerscapacity\', screens.reclinerscapacity )) as screens'))
        .withSchema('bookmyshow').table('cinemas')
        .leftJoin('screens','cinemas.id','screens.cinemaid')
        .join('states','cinemas.stateid', 'states.id')
        .join('cities', 'cinemas.cityid',  'cities.id')
        .groupBy('cinemas.id','states.id','cities.id');

        return result;        
    }
    catch(error){
        console.log(error);
    }
}

exports.getCinema= async(cinemaid)=>{
    try{
        console.log('listing a particular cinema details');
        result=await knex
        .select('cinemas.id', 'cinemas.name', 'cinemas.address', 'cinemas.contactnumber', 'cinemas.website','cinemas.isactive', 
        'cinemas.createdon','cinemas.modifiedon','states.id as stateid', 'states.name as state','cities.id as cityid', 'cities.name as city', 
        knex.raw('json_agg(json_build_object(\'id\', screens.id, \'name\', screens.name, \'capacity\', screens.capacity, \'hasrecliners\', screens.hasrecliners, \'reclinerscapacity\', screens.reclinerscapacity )) as screens'))
        .withSchema('bookmyshow').table('cinemas')
        .leftJoin('screens','cinemas.id','screens.cinemaid')
        .join('states','cinemas.stateid', 'states.id')
        .join('cities', 'cinemas.cityid',  'cities.id')
        .groupBy('cinemas.id','states.id','cities.id').where('cinemas.id',cinemaid);

        return result[0];
    }
    catch(error){
        console.log(error);
    }
}

exports.getCinemaIdByName= async (cinemaname) => {
    try {
      console.log('sending cinema id by cinema name');
      result = await knex.withSchema('bookmyshow').table('cinemas').where('name', cinemaname);
      return result[0].id;
    }
    catch (error) {
      console.log(error);
      res.status(400);
    }
}

exports.getCinemaByName=async(cinemaname)=>{
    try{
        console.log('sending cinema  by cinema name');
        result = await knex.withSchema('bookmyshow').table('cinemas').where('name', cinemaname);
        return result[0];
    }
    catch(error){
        console.log(error);
    }
}

exports.getStatesAndCities=async () => {
    try {
        console.log('getting states and cities');
        // knex.raw('json_agg(cities.*) as cities')   -> if we want the full data of 2nd table 
        // knex.raw('json_agg(json_build_object(\'id\', cities.id, \'name\', cities.name))  ->if we want some fields of 2nd table data
        states=await knex.select('states.*', knex.raw('json_agg(json_build_object(\'id\', cities.id, \'name\', cities.name)) as cities'))
        .withSchema('bookmyshow')
        .table('states')
        .join('cities', 'states.id', 'cities.stateid')
        .groupBy('states.id');

        return states;
    }
    catch (error) {
      console.log(error);
    }
}

exports.addCinema=async (cinema) => {
    try {
        console.log('adding a new cinema');
        await knex.withSchema('bookmyshow').table('cinemas').insert(cinema);
    }
    catch (error) {
        console.log(error);
        res.status(400);
    }
}

exports.getLastCinemaRecordId=async()=>{
    try{
        lastRecord=await knex.withSchema('bookmyshow').table('cinemas').select('id').orderBy([{column:"id",order:"desc"}]).limit(1);
        return lastRecord[0].id;
    }
    catch(error){
        console.log(error);
    }
}

exports.addScreens=async(screens)=>{
    try{
        console.log('adding screens');
        await knex.withSchema('bookmyshow').table('screens').insert(screens);
    }
    catch(error){
        console.log(error);
    }
}

exports.editCinema=async (cinemaid, cinema) => {
    try {
      console.log('updating a cinema details');
      const result = await knex.withSchema('bookmyshow').table('cinemas').where('id', cinemaid).update(
        {
          name: cinema.name,
          address: cinema.address,
          contactnumber: cinema.contactnumber,
          website: cinema.website,
          stateid: cinema.stateid,
          cityid: cinema.cityid,
          modifiedon: new Date()
        }
      )
      return result;
    }
    catch (error) {
      console.log(error);
      res.status(400);
    }
}

exports.editScreens=async (screens)=>{
    try{
        console.log('updating screens');
        const result=await knex.withSchema('bookmyshow').table('screens').insert(screens).onConflict('id').merge();
        return result;
    }
    catch(error){
        console.log(error);
    }
}

exports.deleteCinema= async(cinemaid) => {
    try {
      console.log('deleting a particular cinema');
      const result = await knex.withSchema('bookmyshow').table('cinemas').where('id', cinemaid).update({ isactive: 0 });
      return result;
    }
    catch (error) {
      console.log(error);
    }
}

exports.changeCinemaStatus=async (cinemaid,status) => {
    try {
        console.log('changing status of a cinema');
        await knex.withSchema('bookmyshow').table('cinemas').where('id', cinemaid).update({
            isactive: status ? 1 : 0
        })
    }
    catch (error) {
      console.log(error);
    }
}

exports.deleteScreen=async(screenid)=>{
    try{
      console.log('deleting screen');
      await knex.withSchema('bookmyshow').table('screens').where('id',screenid).delete();
    }
    catch(error){
      console.log(error);
    }
  }
