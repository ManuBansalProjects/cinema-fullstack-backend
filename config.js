//pg database configuration
const configDb = {
  knexPGConfig: {
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      port: 5432,
      user: 'postgres',
      password: 'Manubansal@444',
      database: 'demo'
    }
  }
}



// email notification configuration using nodemailer
const nodemailer = require('nodemailer');

const configMailTransporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  host: 'smtp.gmail.com',
  auth: {
    user: "manubansal.cse23@jecrc.ac.in",
    pass: "Manubansal@444"
  }
});


module.exports = { configDb, configMailTransporter };




