const express = require('express');
const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors({ origin: 'http://localhost:4200' }));

//requiring routes from seperate files
const authRoutes = require('./routes/authRoutes');
const cinemasRoutes = require('./routes/cinemasRoutes');
const moviesRoutes = require('./routes/moviesRoutes');
const showsRoutes = require('./routes/showsRoutes');
const bookingRoutes = require('./routes/bookingRoutes');





//for testing purpose
app.get('/getData', (req, res) => {
  console.log('nodejs testing API is working');
  res.json({ message: 'nodejs testing API is working' });
})

// //responding to requests
app.use('/auth', authRoutes);
app.use('/cinemas', cinemasRoutes);
app.use('/movies', moviesRoutes);
app.use('/shows', showsRoutes);
app.use('/booking', bookingRoutes);

app.listen(3000, () => {
  console.log('server started at 3000 port');
})
