import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name:{type:String,required:true,trim:true}, email:{type:String,required:true,unique:true,lowercase:true,trim:true},
  password:{type:String,required:true,minlength:6}, role:{type:String,enum:['candidate','recruiter'],default:'candidate'},
  avatar:{type:String,default:''}, headline:{type:String,default:''}, location:{type:String,default:''},
  bio:{type:String,default:''}, skills:[String], company:{type:String,default:''}, website:{type:String,default:''}
},{timestamps:true});
export default mongoose.model('User',userSchema);
