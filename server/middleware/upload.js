import multer from 'multer'; import path from 'path'; import fs from 'fs';
const dir=path.resolve('uploads'); if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
const storage=multer.diskStorage({destination:dir,filename:(req,file,cb)=>cb(null,`${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname).toLowerCase()}`)});
const allowed=['.pdf','.doc','.docx'];
export const cvUpload=multer({storage,limits:{fileSize:5*1024*1024},fileFilter:(req,file,cb)=>allowed.includes(path.extname(file.originalname).toLowerCase())?cb(null,true):cb(new Error('Only PDF, DOC and DOCX files are allowed'))});
