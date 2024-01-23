const express = require('express');
const app = express();
const cors = require('cors');
const multer=require('multer');
const bodyparser=require('body-parser');

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.json());
// app.use(cors({ origin: 'http://localhost:4200' }));
app.use(cors({origin:'http://127.0.0.1:5500'}));

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

app.post('/',(req,res)=>{
  console.log(req.body);
  req.body.HrList=JSON.parse(req.body.HrList);
  console.log(req.body);
  res.json({name: 'hello'});
})
// //responding to requests
app.use('/auth', authRoutes);
app.use('/cinemas', cinemasRoutes);
app.use('/movies', moviesRoutes);
app.use('/shows', showsRoutes);
app.use('/booking', bookingRoutes);

app.use('/fun', authRoutes);

app.listen(3001, () => {
  console.log('server started at 3001 port');
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


