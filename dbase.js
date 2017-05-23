
var mongo = require('mongodb').MongoClient
var url = process.env.MONGOLAB_URI // for accessing database

var dbName='nightlife'
var dbNameRSVP='nightlifeRSVP'
var dbNameCity='nightlifeCity'

var dRSVP


function checkConnect(){
   mongo.connect(url, function (err, db) {
     if (err) { console.log('Unable to connect to the mongoDB server. Error:', err)   } 
     else {    console.log('Connection established to mongoDB')
               db.close()}
   
   })
}


function dbInsert(djson){
   mongo.connect(url, function (err, db) {
           if (err) { console.log('Unable to connect to the mongoDB server. Error:', err)   } 
           else {    console.log('Connection established to')
              var dbUrl=db.collection(dbName)
              var value=djson
                            
             
              console.log("value = "+JSON.stringify(value))

              // do some work here with the database.
           
             dbUrl.insert(value,
             function(err, data) {
                 if (err) { throw err }
                 console.log("data inserted")                
                 db.close()
             })
           }  
     }) 
}

function dbInsertRSVP(djson){
   mongo.connect(url, function (err, db) {
           if (err) { console.log('Unable to connect to the mongoDB server. Error:', err)   } 
           else {    console.log('Connection established to')
              var dbUrl=db.collection(dbNameRSVP)
              var value=djson
                            
             
              console.log("value = "+JSON.stringify(value))

              // do some work here with the database.
           
             dbUrl.insert(value,
             function(err, data) {
                 if (err) { throw err }
                 console.log("data inserted")                
                 db.close()
             })
           }  
     }) 
}

function dbInsertCityBook(djson){
   mongo.connect(url, function (err, db) {
           if (err) { console.log('Unable to connect to the mongoDB server. Error:', err)   } 
           else {    console.log('Connection established to')
              var dbUrl=db.collection(dbNameCity)
              var value=djson
                            
             
              console.log("value = "+JSON.stringify(value))

              // do some work here with the database.
           
             dbUrl.insert(value,
             function(err, data) {
                 if (err) { throw err }
                 console.log("data inserted")                
                 db.close()
             })
           }  
     }) 
}



 //==== searching for user name in database
function dbFind(Res,userjson,onSuccess,onFail){ 
   mongo.connect(url, function (err, db) {
           if (err) { console.log('Unable to connect to the mongoDB server. Error:', err)   } 
           else {    console.log('Connection established ')
                 var dbUrl=db.collection(dbName)
                 var sN=userjson
                 var o=[],v=[]   

                 console.log(JSON.stringify(sN))

                 dbUrl.findOne(sN,function(err,dat){
                   if (err) { throw err }
                   db.close()
                   if(dat)
                    {console.log("data "+dat.username)
                     //Res.send("in database");   
                     Res.redirect(onSuccess);
                    }  
                   else
                    {console.log("unknown username")
                     //Res.send("unknown");
                     Res.redirect(onFail);
                    }
                    
                   })
                } 
   })

}

// does the RSVP ...
function dbBookRSVP(Res,djson){ 
   mongo.connect(url, function (err, db) {
           if (err) { console.log('Unable to connect to the mongoDB server. Error:', err)   } 
           else {console.log('MongoDB conncected')
                 console.log('executing function dbBookRSVP')
                 var dbUrl=db.collection(dbNameRSVP)                          
                 var m
                 var isThere={user: djson.user}                                  
                 
                 dbUrl.findOne(isThere,function(err,d){
                   if(err){throw err}
                   if(!d)
                    {dbInsertRSVP(djson)
                     m=djson.user+" is booked..."
                     console.log(m)
                     db.close()
                     var x={city: djson.city, num: djson.num}
                     console.log("new insert : "+JSON.stringify(x)) 
                     dbCityBook(x)  
                     Res.render('return',{message: m})
                    } 
                   else{console.log(djson.user+" exists")
                        already()
                       }
                  })  

                 function already(){
                  dbUrl.findOne(djson,function(err,dat){
                   if (err) { throw err }
                   if(dat)
                    {m=djson.user+" already reserved !"
                     console.log(m)    
                     update()
                     //Res.render('return',{message: m})
                    }  
                   else
                    {m=djson.user+" is booked !"
                     console.log(m)    
                     update()
                     //Res.render('return',{message: m})
                    }
                    
                   })
                  } 

                 function update(){
                  dbUrl.findAndModify(djson,
                  [['_id','asc']], // sort order
                  {$set: {city: djson.city , num: djson.num}}, 
                  {},     
                  function(err, object) {
                     if (err){console.warn(err.message);} //returns error if no matching object 
                     else{console.log(object);
                          db.close()   
                          var x={city: djson.city, num: djson.num}
                          console.log("update : "+JSON.stringify(x))
                          dbCityBook(x)  
                          Res.render('return',{message: m})
                         } 
                   })
                  }
                 
                }
                
                
   })

}

function dbCancelRSVP(Res,djson){ 
   mongo.connect(url, function (err, db) {
           if (err) { console.log('Unable to connect to the mongoDB server. Error:', err)   } 
           else {console.log('MongoDB conncected')
                 console.log('executing function dbCancelRSVP')
                 var dbUrl=db.collection(dbNameRSVP)                          
                 var m
                 var isThere={user: djson.user}
                             
                 console.log("searching for "+JSON.stringify(isThere))                
 
                 dbUrl.findOne(isThere,function(err,d){
                   if(err){throw err}
                   if(d)
                    {m=djson.user+" exists here and canceled"
                     update()
                    } 
                   else
                    {db.close()
                     m="nothing changed"
                     console.log(m)
                     Res.render('return',{message: m})
                    }
                   
                  })  

                 function update(){
                  dbUrl.findAndModify(djson,
                  [['_id','asc']], // sort order
                  {$set: {city: "nowhere" , num: 0}}, 
                  {},     
                  function(err, object) {
                     if (err){console.warn(err.message);} //returns error if no matching object 
                        if(object)
                         {console.log(object);
                          db.close()   
                          var job={city: djson.city, num: djson.num}
                          dbCityCancel(job)
                          Res.render('return',{message: m})
                         }
                        else
                         {db.close()
                          m="nothing found"
                          Res.render('return',{message: m})
                         }    
                          
                   })
                  }
                 
                }
                
                
   })

}

//===== RSVP data for each city 
function dbCityBook(djson){ 
   mongo.connect(url, function (err, db) {
           if (err) { console.log('Unable to connect to the mongoDB server. Error:', err)   } 
           else {console.log('MongoDB conncected')
                 console.log('executing function dbCityBook')
                 var dbUrl=db.collection(dbNameCity)                          
                 var m
                 var isThere={city: djson.city, num: djson.num}                                  
                 
                 dbUrl.findOne(isThere,function(err,d){
                   if(err){throw err}
                   if(!d)
                    {var x={city: djson.city, num: djson.num, going: 1}
                     console.log("x= "+JSON.stringify(x))
                     dbInsertCityBook(x)
                     m=djson.city+" is created ..."
                     console.log(m)
                     db.close()
                     
                    } 
                   else{console.log(djson.city+" exists ...")
                        m=djson.city+" one more going to pub "+d.num
                        update(d.num,d.going+1)
                       }
                  })  

                 function update(pub,going){
                  dbUrl.findAndModify(djson,
                  [['_id','asc']], // sort order
                  {$set: {going: going}}, 
                  {},     
                  function(err, object) {
                     if (err){console.warn(err.message);} //returns error if no matching object 
                     else{console.log(object)
                          console.log(m)
                          db.close()   
                          
                          
                         } 
                   })
                  }
                 
                }
                
                
   })

}

/*
function dbCityCancel(djson){
mongo.connect(url, function (err, db) {
           if (err) { console.log('Unable to connect to the mongoDB server. Error:', err)   } 
           else {console.log('MongoDB conncected')
                 console.log('executing function dbCityCancel')
                 var dbUrl=db.collection(dbNameCity)                          
                 var m
                 var isThere={city: djson.city, num: djson.num}                                  
                 
                 dbUrl.findOne(isThere,function(err,d){
                   if(err){throw err}
                   if(!d)
                    {m=djson.city+" "+djson.num+" does not exists "
                     console.log(m)
                     db.close()
                     
                    } 
                   else{console.log(djson.city+" "+djson.num+" exists ...")
                        m=djson.city+" one less going to pub "+d.num
                        var x=d.going
                        if(x>0){x=x-1}
                        console.log("to write with dbCityCancel x=",x);  
                        update(d.num,x)
                       }
                  })  

                 function update(pub,going){
                  dbUrl.findAndModify(djson,
                  [['_id','asc']], // sort order
                  {$set: {going: going}}, 
                  {},     
                  function(err, object) {
                     if (err){console.warn(err.message);} //returns error if no matching object 
                     else{console.log(object)
                          console.log(m)
                          db.close()   
                          
                          
                         } 
                   })
                  }
                 
                }
                
                
   })
}
*/

function dbCityCancel(djson){ 
   mongo.connect(url, function (err, db) {
           if (err) { console.log('Unable to connect to the mongoDB server. Error:', err)   } 
           else {console.log('MongoDB conncected')
                 console.log('executing function dbCityCancel')
                 var dbUrl=db.collection(dbNameCity)                          
                 var m
                 var isThere={city: djson.city, num: djson.num}                                  
                 
                 dbUrl.findOne(isThere,function(err,d){
                   if(err){throw err}
                   if(!d)
                    {console.log("nothing to be done")
                     db.close()
                     
                    } 
                   else{console.log(djson.city+" exists ...")
                        m=djson.city+" one less going to pub "+d.num
                        var x=d.going
                        if(x>0){x=x-1}
                        console.log("to write x="+x)
                        console.log("djson = "+JSON.stringify(djson))
                        update(d.num,x)
                       }
                  })  

                 function update(pub,going){
                  dbUrl.findAndModify(djson,
                  [['_id','asc']], // sort order
                  {$set: {going: going}}, 
                  {},     
                  function(err, object) {
                     if (err){console.warn(err.message);} //returns error if no matching object 
                     else{console.log(object)
                          console.log(m)
                          db.close()   
                          
                          
                         } 
                   })
                  }
                 
                }
                
                
   })

}



function dbGetRSVP(Res,city,list,user){ 
   mongo.connect(url, function (err, db) {
           if (err) { console.log('Unable to connect to the mongoDB server. Error:', err)   } 
           else {    console.log('Connection established ')
                     console.log('executing function dbGetRSVP')
                 var dbUrl=db.collection(dbNameCity)
                 var sN={city: city}
                 var rsvp=[],x=0   
                 
                 for(var j=0;j<41;++j){rsvp.push(x)}

                 console.log("getting RSVP for "+city)
                 
                 dbUrl.findOne(sN,function(err,d){
                   if(err){throw err}
                   if(d)
                    {console.log("data for "+city+" exists")
                     getMore()
                    } 
                   else
                    {db.close()
                     var m="no data for "+city
                     console.log(m)
                     //Res.render('return',{message: m})
                     Res.render('index',{list: list, User: user, city: city, rsvp: rsvp}) 
                    }
                   
                  })  

                 function getMore()
                 {dbUrl.find(sN)
                  .toArray(function(err,dat){
                  if(err) throw err 
                  var q=dat.length
                  console.log(dat[0].city)
                  for(var i=0;i<q;++i)
                    { console.log( i+1 +". "+dat[i].city+" "+dat[i].num+" "+dat[i].going)
                      rsvp[dat[i].num]=dat[i].going
	            }
                   db.close()
                   doRender()
                  })
                 } 
                }
                function doRender(){
                  Res.render('index',{list: list, User: user, city: city, rsvp: rsvp})}   

                  
   })

}

module.exports=({checkConnect: checkConnect, dbFind: dbFind, dbInsert: dbInsert,
                 dbInsertRSVP: dbInsertRSVP, dbBookRSVP: dbBookRSVP, 
                 dbCancelRSVP: dbCancelRSVP, dbGetRSVP: dbGetRSVP});

exports.dRSVP = dRSVP


