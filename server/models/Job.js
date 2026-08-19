import mongoose from 'mongoose';
const jobSchema = new mongoose.Schema({
  title:{type:String,required:true,trim:true}, company:{type:String,required:true,trim:true}, description:{type:String,required:true},
  location:{type:String,required:true}, type:{type:String,enum:['Full-time','Part-time','Contract','Internship','Remote'],default:'Full-time'},
  experience:{type:String,default:'Mid-level'}, salaryMin:Number,salaryMax:Number,skills:[String],
  recruiter:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}, applicants:{type:Number,default:0},
  featured:{type:Boolean,default:false}, status:{type:String,enum:['open','closed'],default:'open'}
},{timestamps:true});
jobSchema.index({title:'text',company:'text',description:'text',location:'text'});
export default mongoose.model('Job',jobSchema);
