const express = require('express');
const app = express();
app.use(express.json());




app.get('/getData', (req, res) => {
  res.json('nodejs message recieved');
})





//requiring routes from seperate files
const authRoutes = require('./routes/authRoutes');
const cinemasRoutes = require('./routes/cinemasRoutes');
const moviesRoutes = require('./routes/moviesRoutes');
const showsRoutes = require('./routes/showsRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// //responding to requests
app.use('/auth', authRoutes);
app.use('/cinemas', cinemasRoutes);
app.use('/movies', moviesRoutes);
app.use('/shows', showsRoutes);
app.use('/booking', bookingRoutes);

app.listen(3000, () => {
  console.log('server started at 3000 port');
})
