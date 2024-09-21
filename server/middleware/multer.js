const Multer = require('multer');
const path = require('path');
let i =0;
const storage = Multer.diskStorage({
    destination: (req, file, callBack) => {
        const publicDir = path.join(__dirname,'../../','assets');
        const destinationPath = path.join(publicDir,'uploads');
        callBack(null, destinationPath);
    },        
    filename: (req, file, callBack) => {
          const extenction = file.originalname.substring(file.originalname.lastIndexOf('.'));
          callBack(null, `${file.fieldname}-${i}-${Date.now().toString()}${extenction}`);  
          i++;
    }
});


module.exports = store = Multer({storage});