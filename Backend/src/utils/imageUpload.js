const path = require("path");

const uploadPath  =  path.resolve(__dirname, '../../uploads');
 function imageUpload(data, res){
  if(data){
    const myfile = data.profile_image
    const filename = data.profile_image.name;
  }

 }

 module.exports = imageUpload;