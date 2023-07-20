import mongoose from "mongoose";
const schema=mongoose.Schema({
  drug:{
     type:String,
     required:true,
     unique:true,
  },
  sheet:{
    type:Number,
    required:true,
  },
  extraTablet:{
    type:Number,
    required:true,
  },
  tabletsOnSheet:{
    type:Number,
    required:true,
  },
  createdAt:{
      type:String,
      default:Date.now,
  }
});
export let Drug =mongoose.model("Drug",schema);