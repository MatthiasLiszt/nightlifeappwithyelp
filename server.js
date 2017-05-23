// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 5000;

var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var path = require('path')
var indexlink = path.join(__dirname + '/index.html')

var yelp = require('yelp-fusion')
var dbase = require('./dbase')

var List 
var Res 
var Found=false

var clientId = process.env.clientId;
var clientSecret = process.env.clientSecret;

var mongo = require('mongodb').MongoClient

var login="Login"
var User=login
var City=undefined
var RSVP=[]
var Djson

var searchRequest = {
  term:'Coffee',
  location: 'san francisco, ca'
};

// configuration ===============================================================


// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'ilovescotchscotchyscotchscotch', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// start page =================
app.get('/', function(req, res) {    
        Res=res
        if(List === undefined)
         { res.render('index.ejs',{list: " ",User: User,city: City,rsvp: RSVP});} 
        else
         { res.render('index.ejs',{list: List,User: User,city: City,rsvp: RSVP});} 
      });

// search results ==============
app.get('/search', function(req, res) {   
  
   searchRequest.location=req.query.city;
   console.log("searchRequest.location = "+req.query.city);
   City=req.query.city;
  
yelp.accessToken(clientId, clientSecret).then(response => {
   var client = yelp.client(response.jsonBody.access_token); 
 
  client.search(searchRequest).then(response => {
    var numResults = response.jsonBody.businesses.length;
    //var prettyJson = JSON.stringify(firstResult, null, 4);
    var llist=[]
    var datform={name: "",address: "",picture: ""}
    var f;
  
    for(var i=0;i<numResults;++i)
     {f=response.jsonBody.businesses[i];
      //datform.picture="";
      llist.push(new Object());
      llist[i].name=f.name;
      llist[i].address=f.location.address1;
      llist[i].picture=f.image_url;
      llist[i].url=f.url;
      //console.log(i+" "+llist[i].name+" "+llist[i].address);
     }

    List=llist //global variable List 

    for(i=0;i<numResults;++i)
     {console.log(i+" "+llist[i].name+" "+llist[i].address+" "); }
       
    //RSVP=dbase.dRSVP; // unlikely to work 
    //res.render('index.ejs',{list: llist, User: User,city: City,rsvp: RSVP});
    dbase.dbGetRSVP(res,City,llist,User);

  });
 }).catch(e => {
  console.log(e);
 }); 
    
  });

// registration page + registration ========= 

app.get('/register', function(req, res) {   
    res.render('register.ejs');
});

app.post('/savenewuser', function(req, res) {   
    console.log(req.body.username);
    console.log(req.body.password);
    Djson={username: req.body.username, password: req.body.password};
    User=req.body.username;
     var u={username: req.body.username}
    dbase.dbFind(res,u,'registered','doregister');
    //res.send(req.body.username+" "+"has registered.");
});

app.get('/doregister', function(req, res) {   
    dbase.dbInsert(Djson);
    res.send(User+" "+"has registered.");
    //res.render('register.ejs');
});

app.get('/registered', function(req, res) {   
    res.send("Error! user has already been registered !");
    //res.render('register.ejs');
});


// login page + login ========= 

app.get('/login', function(req, res) {   
    res.render('login.ejs',{User: User});
});

app.post('/loginuser', function(req, res) {   
    console.log(req.body.username);
    console.log(req.body.password);
    var u={username: req.body.username, password: req.body.password}
    User=u.username;
    dbase.dbFind(res,u,'dologin','logfail');
    //res.send('some message');
});

app.get('/dologin', function(req, res) {   
    //res.send(User+" logged in");
    var m=User+" logged in";
    res.render('return',{message: m});
});

app.get('/logfail', function(req, res) {   
    var l="login";
    User=l;
    var m="wrong password or username";
    res.render('return',{message: m});
});

app.get('/logout', function(req, res) {   
    User=login; 
    res.redirect('/');
});

// RSVP ===========

app.get('/rsvp/:dCity/:dNum', function(req, res) {   
    var city=req.params.dCity;
    var num=parseInt(req.params.dNum);
    console.log("num "+num);
    console.log("RSVP for "+city+" "+num+" "+List[num].name+" requested.");
    res.render('rsvp',{city: city,num: num,cname: List[num].name,User: User});
});

app.get('/dorsvp/:dCity/:dNum', function(req, res) {   
    var city=req.params.dCity;
    var num=parseInt(req.params.dNum);
    var m=User+" : "+req.query.button+" "+city+" "+num+" "+List[num].name;
    var djson={user: User, city: city, num: num};

    console.log(m);
    //console.log(JSON.stringify(djson));
    if(req.query.button=="rsvp")  
     {dbase.dbBookRSVP(res,djson);}
    else
     {dbase.dbCancelRSVP(res,djson);}

    //res.render('return',{message: m})
    //res.render('rsvp',{city: city,num: num,cname: List[num].name,User: User});
});





// launch ======================================================================
app.listen(port);

console.log('server running on port  ' + port);

