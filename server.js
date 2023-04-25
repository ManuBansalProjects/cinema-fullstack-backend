const express = require('express');
const app = express();
const cors = require('cors');
const multer=require('multer');
const bodyparser=require('body-parser');

app.use(bodyparser.json());
// app.use(express.json());
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










const storage=multer.diskStorage({
  destination: (req,file,callBack)=>{
    callBack(null,'uploads')
  },
  filename:(req,file,callBack)=>{
    callBack(null, `myposter_${file.originalname}`)
  }
})

const upload=multer({storage: storage});

app.post('/file', upload.single('file'), (req,res,next)=>{
  const file=req.file;
  console.log(file);
  if(!file){
    const error=new Error('No File');
    error.httpStatusCode=400;
    return next(error);
  }
  res.send(file);
})

app.post('/multiple-file', upload.array('files'), (req,res,next)=>{
  const files=req.files;
  console.log(files);
  if(!files){
    const error=new Error('No File');
    error.httpStatusCode=400;
    return next(error);
  }
  res.send({status: 'ok'});
})


