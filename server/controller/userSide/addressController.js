var addressDb = require('../../model/addressSchema');



exports.showAddress = async (req,res,next) => {
    const userId = req.query.userId;
    const addressId=req.query.addressId;
    // console.log(userId);
    
    try{
      if(!addressId){
        const address=await addressDb.findOne({"userId":userId}).populate('defaultAddress');
        res.send(address);
      }
      else{
        const address=await addressDb.findOne({"userId":userId })
        const oneAdd = address.address.find(element => {
          return String(element._id) === addressId
        })
        // console.log(oneAdd);
        res.send(oneAdd);
      }
  
    }catch(err){
      // console.log(err);
      // res.status(500).send("internal server error");
      next(err)
    }
  }
  