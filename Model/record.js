const mongoose=require('mongoose');
const remSchema=new mongoose.Schema({
   sId:{
       type:String,
       required:true,
       unique: true
   },
   rEmail:{
       type:String,
       required:true
   },
   mailContent:{
       type:String,
       required:true,
       max:255
   },
   sDateTime:{
       type: String,
       required:true
   }

});

module.exports=mongoose.model('remind',remSchema);