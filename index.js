const express=require('express');
const app=express();
const router=require('express').Router();
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
const schedule = require('node-schedule');
const mailgun = require("mailgun-js");
const rschema=require('./Model/record');
require('dotenv').config();
const mongoose=require('mongoose');
mongoose.connect(process.env.DB_CONNECT,{ useNewUrlParser:true,useUnifiedTopology: true },()=>{
    console.log('DB connected');
});
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// const cors =require("cors")

// app.use(cors());
// //const cors =require("cors")

//app.use(cors());


const initialconfig=async()=>{
    let dbResponse=null;
    let len=await rschema.collection.countDocuments() || 0;
    len=len<10?len:10;
    console.log(len);
    await rschema.find((err,reminds)=>{
       if(err)
           console.log(err);
       else{
        console.log("Yes");
        dbResponse=reminds;   
    }
    }).sort({_id:-1}).limit(len);

    for(let i=0;i<len;i++){
        console.log(dbResponse[i]);
        const dbr=dbResponse[i];
        schedulecontent(dbr.sId,dbr.rEmail,dbr.mailContent,dbr.sDate,dbr.sTime);
    }
}

initialconfig();




 app.get('/get',async(req,res)=>{
   
        res.send("Hello")
});


function schedulecontent(id,rEmail,emailContent,sDateTime){
    console.log("Date-Time"+sDateTime);
    const sdate=new Date(sDateTime);
    const Year=sdate.getFullYear();
    const month=sdate.getMonth();
    const Day=sdate.getDate();
    const hours =sdate.getHours();
    const mins=sdate.getMinutes();
    const schDate=new Date(Year,month,Day,hours,mins,0);
    
    //scheduling code
    console.log(schDate);
     console.log(new Date().getTimezoneOffset());
    const job = schedule.scheduleJob(schDate, function(x){
        console.log('Mail sent on '+x);
        console.log('reciever Mail id'+rEmail);
        console.log('reciever Mail id'+emailContent);
        
        const DOMAIN = process.env.DOMAIN;
        const mg = mailgun({apiKey:process.env.APIKEY, domain: DOMAIN});
        const data = {
            from: "Email Reminder <postmaster@sandboxb5332bcab548452690ee8cdd57e79e9d.mailgun.org>",
            to: rEmail,
            subject:"Email Reminder on "+x,
            text: emailContent
        };
        mg.messages().send(data, function (error, body) {
            console.log(body);
        });
    //scheduling code end
    deleteEntryinDB(id);
    });
}

app.post('/scheduleMail',jsonParser, function (req, res) {
//
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', "*");
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token'); 
    
 //   
const rEmail=req.body.rEmail;
const emailContent=req.body.mailContent;
const sDateTime=req.body.scheduledDateTime;
const sid="sch"+idGenerators(5).toLowerCase();
putValueinDB(sid,rEmail,emailContent,sDateTime);

schedulecontent(sid,rEmail,emailContent,sDateTime);
const response=
        {"Status":"success","message":"Mail scheduled successfully"};
    
    res.json(response).status(200);
  });



let allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', "*");
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token');

    if(req.method==='OPTIONS'){
        res.header('Access-Control-Allow-Methods','GET, POST, PATCH, PUT, DELETE');
        return res.status(200).json({});
    }
    
 // console.log("middleware");
  next();
}
  app.use(allowCrossDomain);

 const  putValueinDB=(sid,rEmail,mailContent,scheduledDateTime)=>{
      
    const recordschema =new rschema({
        sId:sid,
        rEmail:rEmail,
        mailContent:mailContent,
        sDateTime:scheduledDateTime,
        
    });
    try{
const savedrec=  recordschema.save();
console.log("record saved");
return sid;
   }
    catch(err){
console.log(err);
    }
  }


app.listen(8080,"0.0.0.0",()=>{
    console.log('Server Started');
})

function idGenerators(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}
function deleteEntryinDB(id){
    rschema.findOneAndRemove({sId:id},(err)=>{
    console.log(id+"-removed");
    });
}
