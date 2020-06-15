const express=require('express');
const path = require("path");
const bcrypt = require('bcryptjs');
const passport = require('passport');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const config = require('./config/database');
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'invisadelta@gmail.com',
    pass: 'noethicalhacking'
  }
});

app=express();
app.use(expressValidator())
mongoose.connect(config.database,{useNewUrlParser: true,useUnifiedTopology:true});
let db = mongoose.connection;

// Check connection
db.once('open', function(){
  console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', function(err){
  console.log(err);
});

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Bring in User Model
let User = require('./models/user');
let Invitations=require('./models/invitations')
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine','ejs');

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next)
{
  res.locals.user = req.user || null;
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static('public'));

app.get('/',function(req,res){
    res.render('register',{});
})

app.post('/', function(req, res){
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  let errors = req.validationErrors();

  if(errors){
    res.render('register', {
      errors:errors
    });
  } else {
    let newUser = new User({
      email:email,
      username:username,
      password:password
    });

    bcrypt.genSalt(10, function(err, salt)
    {
      bcrypt.hash(newUser.password, salt, function(err, hash)
      {
        if(err)
        {
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(function(err)
        {
          if(err)
          {
            console.log(err);
            return;
          } 
          else 
          {
            res.redirect('/login');
          }
        });
      });
    });
  }
});


app.get('/login',function(req,res)
{
    res.render('login',{});
})

// Login Process
app.post('/login', function(req, res, next)
{
  passport.authenticate('local', {
    successRedirect:'/Invitebox/'+req.body.username+'/invites',
    failureRedirect:'/login',
    failureFlash: true
  })(req, res, next);
});

app.get('/Invitebox/:username/invites',function(req,res)
{
  var username=req.params.username
  let query = {username:username};
  var id;
    User.findOne(query, function(err, user)
    {
      if(err) throw err;
      if(user)
      {
          arrayofinvited=user.invited;
          if(arrayofinvited.length==0)
          {
            res.render("invites",{user:user,invs:[]});
          }
          for(var i=0;i<arrayofinvited.length;i++)
          {
            invs=[];
            var k;
            Invitations.find({_id:arrayofinvited[i]},function(err,result)
            {
              if(err)
                console.log(err);
              if(result)
              {
                k=result[0];
                invs.push(k);
                if(invs.length==arrayofinvited.length)
                  st(invs)  
              }
            })  
          }
          function st(invs){
          res.render("invites",{user:user,invs:invs});
      }
      }
  })
})

app.get('/Invitebox/:username/created',function(req,res)
{
  var username=req.params.username
  let query = {username:username};
  var id;
    User.findOne(query, function(err, user)
    {
      if(err) throw err;
      if(user)
      {
          arrayofinvited=user.created;
          if(arrayofinvited.length==0)
          {
            res.render("created",{user:user,invs:[]});
          }
          for(var i=0;i<arrayofinvited.length;i++)
          {
            invs=[];
            var k;
            Invitations.find({_id:arrayofinvited[i]},function(err,result)
            {
              if(err)
                console.log(err);
              if(result)
              {
                k=result[0];
                invs.push(k);
                if(invs.length==arrayofinvited.length)
                  st(invs)  
              }
            })  
          }
          function st(invs){
          res.render("created",{user:user,invs:invs});
      }
      }
  })
})

app.get('/Invitebox/:username/accepted',function(req,res)
{
  var username=req.params.username
  let query = {username:username};
  var id;
    User.findOne(query, function(err, user)
    {
      if(err) throw err;
      if(user)
      {
          arrayofinvited=user.accepted;
          if(arrayofinvited.length==0)
          {
            res.render("accepted",{user:user,invs:[]});
          }
          for(var i=0;i<arrayofinvited.length;i++)
          {
            invs=[];
            var k;
            Invitations.find({_id:arrayofinvited[i]},function(err,result)
            {
              if(err)
                console.log(err);
              if(result)
              {
                k=result[0];
                invs.push(k);
                if(invs.length==arrayofinvited.length)
                  st(invs)  
              }
            })  
          }
          function st(invs){
          res.render("accepted",{user:user,invs:invs});
      }
      }
  })
})

app.get('/Invitebox/:username/newinv',function(req,res)
{
  var username=req.params.username
  let query = {username:username};
  var id;
    User.findOne(query, function(err, user)
    {
      if(err) throw err;
      if(user)
      {
        res.render("newinvites",{user:user});
      }
  })
})

app.get('/Invitebox/:username/notif',function(req,res)
{
  var username=req.params.username
  let query = {username:username};
  var id;
    User.findOne(query, function(err, user)
    {
      if(err) throw err;
      if(user)
      {
        res.render("notif",{user:user});
      }
  })
})

app.get('/Invitebox/:username/:id/disp',function(req,res)
{
  Invitations.findById(req.params.id,function(err,invs)
  {
    if(invs)
    {
      var username=req.params.username
      let query = {username:username};
      User.findOne(query, function(err, user)
        {
          if(err) throw err;
          if(user)
          {
            res.render("dispinv",{user:user,invs:invs});
          }
      })
    }
  })
})

app.get('/Invitebox/:username/:id/show',function(req,res)
{
  Invitations.findById(req.params.id,function(err,invs)
  {
    if(invs)
    {
      var username=req.params.username
      let query = {username:username};
      User.findOne(query, function(err, user)
        {
          if(err) throw err;
          if(user)
          {
            res.render("dispinva",{user:user,invs:invs});
          }
      })
    }
  })
})


app.post('/remove/:username/:notif',function(req,res,next)
{
  console.log(req.params.notif)
  str=req.params.notif;
  console.log(str);
  User.updateOne({username:req.params.username},{$pull:{"notif":str}},function(err,succ){
    if(err)
      console.log(err);
    if(succ)
      {res.redirect("/Invitebox/"+req.params.username+"/notif")}
  })
})

app.post('/:name/:uid/:iid/accept',function(req,res,next)
{
  User.updateOne({_id:req.params.uid},{$push:{accepted:req.params.iid}},function(err,succ){
    if(err)
      console.log(err);
  })
  User.updateOne({_id:req.params.uid},{$pull:{invited:req.params.iid}},function(err,succ){
    if(err)
      console.log(err);
  })
  nonveg=req.body.nonveg;
  veg=req.body.veg;
  nop=req.body.nop;
  date=new Date();
  str=req.params.name+"^has^accepted^your^invitation^at^"+date+".^";
  if(nop)
  {
    str+=nop+"^people^are^comming.^";
  }
  if(veg)
  {
    str+="They^prefer^Vegetarian."
  }
  if(nonveg)
  {
    str+="They^prefer^Non-Vegetarian."
  }
  Invitations.findById(req.params.iid,function(err,invs){
    if(invs)
    {
      usernamea=invs.host;
      let query={username:usernamea};
      User.updateOne(query,{$push:{notif:str}},function(err,succ){
        if(err)
          console.log(err);
        name=req.params.name
        res.redirect("/Invitebox/"+name+"/invites")
      })
    }
  })
})

app.post('/:name/newinv',function(req,res,next)
{
  var usernamea=req.params.name;
  let query = {username:usernamea};
    User.findOne(query, function(err, user)
    {
      if(err) throw err;
      if(user)
      {
        var idu=user._id;
        var host=user.username;
        var on=req.body.all;
        var called=req.body.called.split(" ")
        let newInv= new Invitations(
        {
          header:req.body.header,
          footer:req.body.footer,
          content:req.body.content,
          typeof:req.body.typeof,
          atTime:req.body.atTime,
          deadline:req.body.deadline,
          host:host,
        })
        var id;
        newInv.save(function(err,result)
        {
          if(err)
            console.log(err)
          else
            id=result._id;
          Invitations.findById(id,function(err,inv)
          {
            // if(inv)
              // console.log(inv.id);
            User.updateOne({_id:idu},{$push: {created:id}},function(err,succ)
            {
              if(err)
                console.log(err)
            })
            var str=host+"^has^invited^for^"+req.body.typeof+"^at^"+req.body.atTime
            if(on)
            {
              User.updateMany({},{$push:{invited:id}},function(err,succ)
              {
                if(err)
                  console.log(err)
              })
              User.updateMany({},{$push:{notif:str}},function(err,succ)
              {
                if(err)
                  console.log(err)
              })
              User.findOne({},function(err,user){
                if(err)
                {
                  console.log(err);
                }
                if(user&&user.username!=host)
                {
                  var email=user.email;
                  console.log(email);
                  var sr="From "+host
                  var mailOptions = {
                from: 'invisadelta@gmail.com',
                to: email,
                subject: sr,
                text: str,
              }
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
                }
              })
              User.updateOne({_id:idu},{$pop:{invited:1}},function(err,succ)
              {
                if(err)
                  console.log(err)
              })
              User.updateOne({_id:idu},{$pop:{notif:1}},function(err,succ)
              {
                if(err)
                  console.log(err)
              })
            }
            else
            {
              for(var i=0;i<called.length;i++)
              {
                username1=called[i];
                User.updateOne({username:username1},{$push:{invited:id}},function(err,succ)
                {
                  if(err)
                    console.log(err)
                })
                User.updateOne({username:username1},{$push:{notif:str}},function(err,succ)
                {
                  if(err)
                    console.log(err)
                })
                User.findOne({username:username1},function(err,user){
                  if(err)
                  {
                    console.log(err);
                  }
                  if(user)
                  {
                    var email=user.email;
                    console.log(email);
                    var sr="From "+host
                    var mailOptions = {
                  from: 'invisadelta@gmail.com',
                  to: email,
                  subject: sr,
                  text: str,
                }
                transporter.sendMail(mailOptions, function(error, info){
                  if (error) {
                    console.log(error);
                  } else {
                    console.log('Email sent: ' + info.response);
                  }
                });
                  }
                })
              }
            }
          })
          res.redirect('/Invitebox/'+host+'/created');
        })
      }
  })
})

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});

app.listen(process.env.PORT||5000,function()
{
    console.log("server started in port 5000");    
})