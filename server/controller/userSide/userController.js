const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const geolib = require('geolib');

const axios = require('axios');



const User = require("../../model/userSchema");
const Category = require("../../model/categorySchema");
const Item = require("../../model/itemSchema");
const AddressDb = require("../../model/addressSchema")
const OtpDb = require("../../model/otpSchema")


// exports.signUp = async (req, res) => {
//     const { username, email, password, confirmPassword, phone } = req.body;    
//     try {
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             req.session.signUpError = "User already exists with this email.";
//             return res.redirect('/signup');
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         const newUser = new User({
//             username,
//             email,
//             password: hashedPassword,
//             phone
//         });

//         await newUser.save();

//         req.session.email = newUser.email;
//         req.session.userId = newUser._id;
//         req.session.isUserAuth = true;
//         req.session.isUserAuthenticated = true;

//         res.redirect('/');
//     } catch (err) {
//         console.error(err);
//         req.session.signUpError = "An error occurred during signup.";
//         res.redirect('/signup');
//     }
// };

// exports.signUp = async (req, res) => {
//   const { username, email, password, confirmPassword, phone, street, block, unitnum, postal } = req.body;

//   try {
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       console.log('User already exists');
//       req.session.signUpError = "User already exists with this email.";
//       return res.redirect('/signup');
//     }

//     if (password !== confirmPassword) {
//       req.session.signUpError = "Passwords do not match.";
//       return res.redirect('/signup');
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = new User({
//       username,
//       email,
//       password: hashedPassword,
//       phone,
//     });

//     await newUser.save();

//     const structuredAddress = `${username}, ${phone}, ${street}, ${block}, ${unitnum}, ${postal}`
//     // const newAddress = new AddressDb({
//     //     userId: newUser._id,
//     //     address: {
//     //         username,
//     //         phone,
//     //         street,
//     //         block,
//     //         unitnum,
//     //         postal,
//     //         structuredAddress
//     //     },
//     //     defaultAddress: null,
//     // });

//     // await newAddress.save();
//     const newAddress = new AddressDb({
//       userId: newUser._id,
//       address: [{
//         _id: new mongoose.Types.ObjectId(),
//         username,
//         phone,
//         street,
//         block,
//         unitnum,
//         postal,
//         structuredAddress
//       }],
//       defaultAddress: null
//     });

//     const savedAddress = await newAddress.save();

//     const addressId = savedAddress.address[0]._id;

//     await AddressDb.findByIdAndUpdate(
//       savedAddress._id,
//       { defaultAddress: addressId },
//       { new: true }
//     );
//     req.session.username = newUser.username;
//     req.session.email = newUser.email;
//     req.session.userId = newUser._id;
//     req.session.isUserAuthenticated = true;
//     req.session.isUserAuth = true;

//     res.redirect('/');
//   } catch (err) {
//     console.error(err);
//     req.session.signUpError = "An error occurred during signup.";
//     res.redirect('/signup');
//   }
// };

exports.signUp = async (req, res) => {
  const { username, email, password, confirmPassword, phone, street, block, unitnum, postal } = req.body;

  const errors = {};

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      errors.signUpError = "User already exists with this email.";
    }

    if (password !== confirmPassword) {
      errors.signUpError = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      req.session.errors= errors;
      return res.redirect('/signup');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      phone,
    });

    await newUser.save();

    const structuredAddress = `${username}, ${phone}, ${street}, ${block}, ${unitnum}, ${postal}`;

    const newAddress = new AddressDb({
      userId: newUser._id,
      address: [{
        _id: new mongoose.Types.ObjectId(),
        username,
        phone,
        street,
        block,
        unitnum,
        postal,
        structuredAddress
      }],
      defaultAddress: null
    });

    const savedAddress = await newAddress.save();

    const addressId = savedAddress.address[0]._id;
    await AddressDb.findByIdAndUpdate(
      savedAddress._id,
      { defaultAddress: addressId },
      { new: true }
    );

    req.session.username = newUser.username;
    req.session.email = newUser.email;
    req.session.userId = newUser._id;
    req.session.isUserAuthenticated = true;
    req.session.isUserAuth = true;

    res.redirect('/');
  } catch (err) {
    console.error(err);
    req.session.errors= { signUpError: "An error occurred during signup." };
    res.redirect('/signup');
  }
};

exports.signIn = async (req, res) => {
  const { emailOrPhone, password } = req.body;
  
  const errors = {};

  try {
    const foundUser = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }]
    });

    if (!foundUser) {
      errors.signInError = "User with this email or phone number does not exist.";
      req.session.errors = errors;
      return res.redirect("/signin");
    }

    const isPasswordMatch = await bcrypt.compare(password, foundUser.password);

    if (isPasswordMatch) {
      if (foundUser.isBlocked) {
        errors.signInError = "Your account has been blocked by the admin. Please contact support.";
        req.session.errors = errors; 
        return res.redirect("/signin");
      }

      req.session.username = foundUser.username;
      req.session.email = foundUser.email;
      req.session.phone = foundUser.phone;
      req.session.userId = foundUser._id;
      req.session.isUserAuth = true;
      req.session.isUserAuthenticated = true;
      return res.redirect("/");
    } else {
      errors.signInError = "The password you entered is incorrect. Please try again.";
      req.session.errors = errors; 
      return res.redirect("/signin");
    }
  } catch (err) {
    console.error(err);
    req.session.errors = { signInError: "An unexpected error occurred during signin. Please try again." };
    res.redirect("/signin");
  }
};



// exports.signIn = async (req, res) => {
//   const log = {
//     emailOrPhone: req.body.emailOrPhone, // Accepting either email or phone
//     password: req.body.password,
//   };

//   try {
//     // Find user by email or phone
//     const foundUser = await User.findOne({
//       $or: [{ email: log.emailOrPhone }, { phone: log.emailOrPhone }]
//     });

//     if (!foundUser) {
//       req.session.validEmail = "User with this email or phone number does not exist";
//       return res.redirect("/signin");
//     }

//     const isPasswordMatch = await bcrypt.compare(log.password, foundUser.password);

//     if (isPasswordMatch && !foundUser.isBlocked) {
//       req.session.username = foundUser.username;
//       req.session.email = foundUser.email;
//       req.session.phone = foundUser.phone;
//       req.session.userId = foundUser._id;
//       req.session.isUserAuth = true;
//       req.session.isUserAuthenticated = true;
//       return res.redirect("/");
//     } else {
//       // Handle wrong password or blocked account
//       if (!isPasswordMatch) {
//         req.session.wrongPassword = "Wrong Password";
//         return res.redirect("/signin");
//       }
//       if (foundUser.isBlocked) {
//         req.session.validEmail = "User is blocked by admin";
//         return res.redirect("/signin");
//       }
//     }
//   } catch (err) {
//     console.error(err);
//     res.redirect("/signin");
//   }
// }


// OTP genneration , forgot password section

const otpGenrator = () => {
  return Math.floor(100000 + Math.random() * 900000); // Generates a random 6-digit number
};

const deleteOtpFromdb = async (_id) => {
  await OtpDb.deleteOne({ _id });
};

// const sendOtpMail = async (req, res) => {
//   req.session.name = req.body.name;
//   const otp = otpGenrator();
//   console.log(otp);

//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.AUTH_EMAIL,
//       pass: process.env.AUTH_PASS,
//     },
//   });

//   const MailGenerator = new Mailgen({
//     theme: "default",  // Default Mailgen theme
//     product: {
//       name: "Pepper Castle", // Company name
//       // link: "https://peppercastle.com/",
//       logo: "assets/images/fav.png", 
//       // Theme color and other custom settings
//       theme: {
//         header: {
//           backgroundColor: '#fc5000',  // Custom theme color
//         },
//       },
//     },
//   });

//   const response = {
//     body: {
//       name: req.session.name,  // Personalized with the user's name
//       intro: `Your OTP for Pepper Castle verification is:`,
//       table: {
//         data: [
//           {
//             OTP: otp,
//           },
//         ],
//       },
//       outro: "If you did not request this OTP, please ignore this email.",
//       signature: "Thank you for choosing Pepper Castle!",
//     },
//   };

//   const mail = MailGenerator.generate(response);

//   const message = {
//     from: process.env.AUTH_EMAIL,
//     to: req.session.user,
//     subject: "Pepper Castle OTP Verification",
//     html: mail,
//   };

//   try {
//     const newOtp = new OtpDb({
//       email: req.session.email,
//       otp: otp,
//       createdAt: Date.now(),
//       expiresAt: Date.now() + 60000,  // OTP expiration (1 minute)
//     });
//     const data = await newOtp.save();
//     req.session.otpId = data._id;

//     // Send email and redirect on success
//     await transporter.sendMail(message);
//     res.status(200).redirect("/otp-verication");
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("An error occurred while sending the email.");
//   }
// };

const forgotOtpSendOtpMail = async (req, res) => {
  const otp = otpGenrator();  // Generate new OTP
  const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
          user: process.env.AUTH_EMAIL,
          pass: process.env.AUTH_PASS,
      },
  });

  const MailGenerator = new Mailgen({
      theme: "default",  
      product: {
          name: "Pepper Castle",
          link: "https://peppercastle.com/",
      },
  });

  const response = {
      body: {
          name: req.session.username,
          intro: `Your OTP for Pepper Castle verification is:`,
          table: {
              data: [
                  { OTP: `<strong style="font-size: 24px;color:#000">${otp}</strong>` },
              ],
          },
          outro: "If you did not request this OTP, please ignore this email.",
          signature: "Thank you for choosing Pepper Castle!",
      },
  };

  const mail = MailGenerator.generate(response);
  const message = {
      from: process.env.AUTH_EMAIL,
      to: req.session.forgotuser,
      subject: "Pepper Castle OTP Verification",
      html: mail,
  };

  try {
      // Save new OTP and expiration time in the database
      const newOtp = new OtpDb({
          email: req.session.forgotuser,
          otp: otp,
          createdAt: Date.now(),
          expiresAt: Date.now() + 60000,  // OTP expires in 60 seconds
      });
      const data = await newOtp.save();
      
      req.session.forgototpId = data._id;
      req.session.rTime = 60;  // Reset countdown time to 60 seconds
      res.status(200).redirect("/otp-verification");
      
      await transporter.sendMail(message);
  } catch (error) {
      console.log(error);
  }
};



const forgotuserOtpVerify = async (req, res) => {
  try {
    const data = await OtpDb.findOne({ _id: req.session.forgototpId });

    if (!data) {
      req.session.err = "OTP Expired";
      req.session.rTime = "0";
      return res.status(401).redirect("/otp-verification");
    }

    if (data.expiresAt < Date.now()) {
      req.session.err = "OTP Expired";
      req.session.rTime = "0";
      deleteOtpFromdb(req.session.forgototpId);
      return res.status(401).redirect("/otp-verification");
    }

    if (data.otp != req.body.otp) {
      req.session.err = "Wrong OTP";
      req.session.rTime = req.body.rTime;
      return res.status(401).redirect("/otp-verification");
    }

    return true;
  } catch (err) {
    console.log("Function error", err);
    res.status(500).send("Error while quering data err:");
  }
};

exports.forgotOtp = async (req, res) => {
  console.log('body:', req.body);
  req.session.user = req.body.email;

  if (req.body.email == "") {
    req.session.message = "email is required"
    return res.redirect("/forgot-password");
  }
  const foundUser = await User.findOne({ email: req.body.email });
  if (!foundUser) {
    req.session.message = "user not exist";
    return res.redirect("/forgot-password");
  }
  req.session.username = foundUser.username
  req.session.forgotuser = req.body.email;

  forgotOtpSendOtpMail(req, res);
};


exports.forgototpverification = async (req, res) => {
  try {
      if (!req.body.otp) {
          req.session.err = "This Field is required";
          return res.status(200).redirect("/otp-verification");
      }

      const response = await forgotuserOtpVerify(req, res);

      if (response) {
          deleteOtpFromdb(req.session.forgotOtpResend);  // Delete used OTP from database
          req.session.verifyChangePassPage = true;
          res.status(200).redirect("/reset-password");
      }
  } catch (err) {
      console.log("Internal error", err);
      res.status(500).send("Error while querying data");
  }
};


exports.forgotOtpResend = async (req, res) => {
  try {
      // Delete previous OTP from database
      deleteOtpFromdb(req.session.forgotOtpResend);
      
      // Resend a new OTP and restart countdown
      forgotOtpSendOtpMail(req, res);

      // Clear session errors and reset countdown time
      delete req.session.err;
      req.session.rTime = 60;  // Reset countdown to 60 seconds
  } catch (err) {
      console.log("Resend Mail error:", err);
  }
};




exports.updatepassword = async (req, res) => {

  const hashedpassword = await bcrypt.hash(req.body.password, 10);

  const updateuser = await User.updateOne(
    { email: req.session.forgotuser },
    { $set: { password: hashedpassword } }
  );
  res.redirect("/signin");
};


exports.signOut = async (req, res) => {

  req.session.isUserAuth = false;
  req.session.isUserAuthenticated = false;
  delete req.session.email
  delete req.session.phone
  delete req.session.userId
  res.redirect("/")
}

exports.getLocationDetails = async (req, res) => {
  const { latitude, longitude } = req.body
  console.log(latitude, longitude);
  req.session.latitude = latitude;
  req.session.longitude = longitude;
  const deliveryLocation = { latitude: 11.873567564458085, longitude: 75.38882081116785 };
  const userLocation = { latitude: req.session.latitude, longitude: req.session.longitude };

  // const deliveryLocation = { latitude: 1.3110285534979251, longitude: 103.79496585267069 }; // pepper castle location 
  // const userLocation = { latitude: 1.3067381388575823, longitude: 103.79125367543192 }; // pepper castle nearby location ->600 m  

  const distanceInMeters = geolib.getDistance(deliveryLocation, userLocation);
  const distanceInKilometers = distanceInMeters / 1000;

  const deliveryRadius = 10;
  console.log(distanceInKilometers);

  const isInDeliveryRange = distanceInKilometers <= deliveryRadius;
  console.log(isInDeliveryRange);
  req.session.distanceInKilometers = distanceInKilometers,
    // Send response with delivery range status and user's latitude and longitude
    res.send(isInDeliveryRange);
}

exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.query.userId;

    // Use aggregation pipeline to fetch user data
    const userProfile = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(userId) } // Match the user by ID
      },
      {
        $project: {
          _id: 0,              // Exclude _id from the result
          username: 1,         // Include username field
          email: 1,            // Include email field
          phone: 1             // Include phone field
        }
      }
    ]);

    // Check if user exists
    if (userProfile.length === 0) {
      return res.status(404).send('User not found');
    }
    const user = userProfile[0]
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}

// exports.changePassword = async (req, res) => {
//   const userid = req.session.userId;
//   console.log(userid);
//   const {oldpassword, newpassword } = req.body
//   console.log(oldpassword, newpassword)
//   // res.redirect("/userProfile")
//   try {
//     const foundUser = await User.findOne({ _id: userid });
//     const isPasswordMatch = await bcrypt.compare(
//       oldpassword,
//       foundUser.password
//     );
//     const hashedpassword = await bcrypt.hash(newpassword, 10);
//     if (!isPasswordMatch) {
//       console.log(isPasswordMatch);
      
//       req.session.message = "Wrong Password"
//       res.redirect("/change-password")
//     } else {
//       await User.updateOne({ _id: userid }, {
//         $set: {
//           password: hashedpassword
//         }
//       })
//       req.session.isUserAuth = false;
//       req.session.isUserAuthenticated = false;
//       delete req.session.email
//       delete req.session.phone
//       delete req.session.userId
//       res.redirect("/signin")
//     }
//   } catch (err) {
//     res.status(500).send(err)
//   }
// }

exports.changePassword = async (req, res) => {
  const userId = req.session.userId;
  const { oldpassword, newpassword, confirmpassword } = req.body;

  const errors = {};

  if (!oldpassword || !newpassword || !confirmpassword) {
    if (!oldpassword) errors.oldpassword = "Old password is required.";
    if (!newpassword) errors.newpassword = "New password is required.";
    if (!confirmpassword) errors.confirmpassword = "Confirm password is required.";
  }

  if (newpassword !== confirmpassword) {
    errors.confirmpassword = "New password and confirm password do not match.";
  }

  if (Object.keys(errors).length > 0) {
    req.session.errors = errors;
    return res.redirect("/change-password");
  }

  try {
    const foundUser = await User.findOne({ _id: userId });
    if (!foundUser) {
      req.session.errors = { oldpassword: "User not found." };
      return res.redirect("/change-password");
    }

    const isPasswordMatch = await bcrypt.compare(oldpassword, foundUser.password);
    if (!isPasswordMatch) {
      req.session.errors = { oldpassword: "Old password is incorrect." };
      return res.redirect("/change-password");
    }

    const hashedPassword = await bcrypt.hash(newpassword, 10);
    await User.updateOne({ _id: userId }, { $set: { password: hashedPassword } });

    req.session.isUserAuth = false;
    req.session.isUserAuthenticated = false;
    delete req.session.email;
    delete req.session.phone;
    delete req.session.userId;
    res.redirect("/signin");
  } catch (err) {
    console.error(err);
    req.session.errors = { general: "An error occurred. Please try again." };
    res.redirect("/change-password");
  }
};


exports.changeProfile = async (req, res) => {
  const userId = req.session.userId;
  const { username, phone, password } = req.body;
  const errors = {};

  if (!username || !phone || !password) {
    if (!username) errors.username = "Username is required.";
    if (!phone) errors.phone = "Phone number is required.";
    if (!password) errors.password = "Password is required.";
  }

  if (Object.keys(errors).length > 0) {
    req.session.errors = errors;
    return res.redirect("/profile");
  }

  try {
    const foundUser = await User.findOne({ _id: userId });
    if (!foundUser) {
      req.session.errors = { general: "User not found." };
      return res.redirect("/profile");
    }

    const isPasswordMatch = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordMatch) {
      req.session.errors = { password: "Password is incorrect." };
      return res.redirect("/profile");
    }

    await User.updateOne({ _id: userId }, {
      $set: {
        username: username,
        phone: phone
      }
    });

    req.session.username = username;
    req.session.phone = phone;

    res.redirect("/profile");
  } catch (err) {
    console.error(err);
    req.session.errors = { general: "An error occurred. Please try again." };
    res.redirect("/profile");
  }
};


exports.getGoogleMaplocation = async (req, res) => {
  const { pincode } = req.body;
  console.log(pincode);
  
  if (!pincode) {
    return res.status(400).json({ message: 'Pincode is required' });
  }

  try {
    // Use Google Maps Geocoding API to get latitude and longitude from pincode
    const apiKey = 'AIzaSyDrI6NNSHKGcRHyaxv3UnjfjUAmt07DlJ8'; // Replace with your actual API key
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&key=${apiKey}`;
    // console.log(geocodeUrl);
    
    const response = await axios.get(geocodeUrl);
    const { data } = response;
    console.log(response.data);
    

    if (data.status !== 'OK' || !data.results.length) {
      return res.status(400).json({ message: 'Invalid pincode or location not found' });
    }

    // Get user's latitude and longitude from the geocoding response
    const userLocation = data.results[0].geometry.location;
    const userLatitude = userLocation.lat;
    const userLongitude = userLocation.lng;

    // Calculate the distance between the shop and user's location
    const distance = calculateDistance(11.873567564458085, 75.38882081116785, userLatitude, userLongitude);

    // Check if the distance is within 10 km
    if (distance <= 10) {
      return res.status(200).json({ message: 'Success, within 10 km', distance });
    } else {
      return res.status(400).json({ message: 'Failure, out of range', distance });
    }

  } catch (error) {
    console.error('Error fetching location from Google Maps API:', error);
    return res.status(500).json({ message: 'Internal Server Error', error });
  }
}



