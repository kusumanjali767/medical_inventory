import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import {Drug} from "./app.js";
const app=express();
app.use(express.json());
app.use(cookieParser());
mongoose.connect("mongodb://127.0.0.1:27017",{
    dbName:"medicoinfo",
}).then(()=>{console.log("Database connected")}).catch((e)=>{console.log(e)});
const schema=new mongoose.Schema({
    userName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        select:false,
    },
    conformPassword:{
        type:String,
        required:true,
        select:false,
    },
    createAt:{
      type:Date,
      required:true,
      default:Date.now,
    }
});
const Users=mongoose.model("Users",schema);
app.get("/",(req,res)=>{
    res.send("hii");
})
app.post("/login",async(req,res)=>{
   const {email,password}=req.body;
   const user=await Users.findOne({email}).select("+password");
   if(!user) return res.json({
    success:false,
    message:"Invalid Email or password",
   })
   const isEqual=await bcrypt.compare(password,user.password);
   if(!isEqual) return res.json({
    success:false,
    message:"Invalid Email or Password",
})
  const token=jwt.sign({_id:user._id},"asdfgh");
   res.cookie("token",token,({
     httpOnly:true,
     maxAge:10*60*1000,
   })).json({
    success:true,
    message:"Loged in Successfully",
   })
})
app.post("/signup",async(req,res)=>{
     const {userName,email,password,conformPassword}=req.body;
     let user=await Users.findOne({email});
     if(user) return res.json({
        success:false,
        message:"User Already Exist",
     })
     const hashedPassword=await bcrypt.hash(password,10);
     const hashedconformPassword=await bcrypt.hash(conformPassword,10);
     if(!conformPassword) return res.json({
        success:false,
        message:"Fill conformPassword",
     })
     if(password!=conformPassword) return res.json({
        success:false,
        message:"Conform your Password",
     })
     user=await Users.create({userName,email,password:hashedPassword,conformPassword:hashedconformPassword});
     const token=jwt.sign({_id:user._id},"asdfgh");
    res.cookie("token",token,({
        httpOnly:true,
        maxAge:10*60*1000,
    })).json({
      success:true,
      message:"Successfully signedup",
    })
});
app.get("/logout",(req,res)=>{
   res.cookie("token","",({expires:new Date(Date.now())})).json({
    success:true,
   })
});
app.post("/drugs",async(req,res)=>{
   const {drug,sheet,lastTablet,tabletsOnSheet}=req.body;
   let drugs=await  Drug.findOne({drug});
   if(drugs) return res.json({
    success:false,
    message:"Drug exist Update its count",
   });
   drugs=await Drug.create({drug,sheet,lastTablet,tabletsOnSheet});
   res.json({
    success:true,
    message:"Successfully Added",
   })
});
app.get("/getDrug",async(req,res)=>{
   let {drug,numberOfSheets,extratablets}=req.body;
   const drugs=await Drug.findOne({drug});
    if(!drugs) return res.json({
        success:false,
        Message:"reqired drug is not there",
    });
    let sheets=drugs.sheet;
    const  fixed=drugs.tabletsOnSheet;
    let lastTablets=drugs.lastTablet;
   if(sheets<1) return res.json({
    success:false,
    Message:"Need to update drug",
   });
   if(numberOfSheets>sheets) return res.json({
    success:false,
    Message:`${sheets} are there`,
   });
    numberOfSheets=(extratablets/fixed)+numberOfSheets;
    extratablets=extratablets%fixed;
        if(numberOfSheets>sheets) return res.json({
            success:false,
            message:`${sheets} sheets are there`,
        });
        if((numberOfSheets<sheets) && (extratablets<lastTablets)){
           Drug.updateOne({"sheet":sheets},{$Set:{"sheet":(sheets-numberOfSheets)}});
            Drug.updateOne({"lastTablet":lastTablets},{$Set:{"lastTablet":(lastTablets-extratablets)}});
        return res.json({
            success:true,
            message:"success",
        })};
        if(numberOfSheets<sheets && extratablets==lastTablets){
        Drug.updateOne({"sheet":sheets},{$Set:{"sheet":(sheets-numberOfSheets)+1}});
        Drug.updateOne({"lastTablet":lastTablets},{$Set:{"lastTablet":fixed}});
        return res.json({
            success:true,
            message:"as",
        })};
        if(numberOfSheets===sheets && extratablets<=lastTablets){
            Drug.updateOne({"sheet":sheets},{$Set:{"sheet":(numberOfSheets-sheets)}});
            Drug.updateOne({"lastTablet":lastTablets},{$Set:{"lastTablet":extratablets-lastTablets}});
            return res.json({
                success:true,
                message:"fs",
            });
        };

});
/*app.put("/update",async(req,res)=>{
  const {sheet,lastTablet,tabletsOnSheet}=req.body;
  const drugs=await Drug.update({});

});*/
app.delete("/delete",async(req,res)=>{
    const {drug}=req.body;
  const drugs=await Drug.deleteOne({drug})
  res.json({
    success:true,
    message:"Drug removed Successfully",
  });
});
app.listen(3000,()=>{
    console.log("server started");
});
