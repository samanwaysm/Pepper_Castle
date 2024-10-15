const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");


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

exports.signUp = async (req, res) => {
  const { username, email, password, confirmPassword, phone, street, block, unitnum, postal } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists');
      req.session.signUpError = "User already exists with this email.";
      return res.redirect('/signup');
    }

    if (password !== confirmPassword) {
      req.session.signUpError = "Passwords do not match.";
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

    const structuredAddress = `${username}, ${phone}, ${street}, ${block}, ${unitnum}, ${postal}`
    // const newAddress = new AddressDb({
    //     userId: newUser._id,
    //     address: {
    //         username,
    //         phone,
    //         street,
    //         block,
    //         unitnum,
    //         postal,
    //         structuredAddress
    //     },
    //     defaultAddress: null,
    // });

    // await newAddress.save();
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

    req.session.email = newUser.email;
    req.session.userId = newUser._id;
    req.session.isUserAuthenticated = true;
    req.session.isUserAuth = true;

    res.redirect('/');
  } catch (err) {
    console.error(err);
    req.session.signUpError = "An error occurred during signup.";
    res.redirect('/signup');
  }
};

exports.signIn = async (req, res) => {  
  const log = {
    emailOrPhone: req.body.emailOrPhone, // Accepting either email or phone
    password: req.body.password,
  };

  try {
    // Find user by email or phone
    const foundUser = await User.findOne({
      $or: [{ email: log.emailOrPhone }, { phone: log.emailOrPhone }]
    });

    if (!foundUser) {
      req.session.validEmail = "User with this email or phone number does not exist";
      return res.redirect("/signin");
    }

    const isPasswordMatch = await bcrypt.compare(log.password, foundUser.password);

    if (isPasswordMatch && !foundUser.isBlocked) {
      req.session.email = foundUser.email;
      req.session.phone = foundUser.phone;
      req.session.userId = foundUser._id;
      req.session.isUserAuth = true;
      req.session.isUserAuthenticated = true;
      return res.redirect("/");
    } else {
      // Handle wrong password or blocked account
      if (!isPasswordMatch) {
        req.session.wrongPassword = "Wrong Password";
        return res.redirect("/signin");
      }
      if (foundUser.isBlocked) {
        req.session.validEmail = "User is blocked by admin";
        return res.redirect("/signin");
      }
    }
  } catch (err) {
    console.error(err);
    res.redirect("/signin");
  }
}


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
  const otp = otpGenrator();
  console.log(otp);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASS,
    },
  });

  const MailGenerator = new Mailgen({
    theme: "default",  // Default Mailgen theme
    product: {
      name: "Pepper Castle", // Company name
      link: "https://peppercastle.com/", 
      logo: "assets/images/fav.png", 
      theme: {
        header: {
          backgroundColor: '#fc5000',  // Custom theme color
        },
      },
    },
  });

  const response = {
    body: {
      name: req.session.name,  // Personalized with the user's name
      intro: `Your OTP for Pepper Castle verification is:`,
      table: {
        data: [
          {
            OTP: otp,
          },
        ],
      },
      outro: "If you did not request this OTP, please ignore this email.",
      signature: "Thank you for choosing Pepper Castle!",
    },
  };

  const mail = MailGenerator.generate(response);

  const message = {
    from: process.env.AUTH_EMAIL,
    to: req.session.user,
    subject: "Pepper Castle OTP Verification",
    html: mail,
  };

  try {
    const newOtp = new OtpDb({
      email: req.session.forgotuser,
      otp: otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60000,
    });
    const data = await newOtp.save();
    req.session.forgototpId = data._id;
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
  console.log('body:',req.body);
  req.session.user=req.body.email;
  
  if (req.body.email=="") {
    req.session.message= "email is required"
    return  res.redirect("/forgot-password");
  }
  const foundUser = await User.findOne({ email: req.body.email });
  if (!foundUser) {
    console.log(foundUser);
    req.session.message = "user not exist";
    return res.redirect("/forgot-password");
  }

  req.session.forgotuser = req.body.email;

  forgotOtpSendOtpMail(req, res);
};


exports.forgototpverification = async (req, res) => {
  try {
    if (!req.body.otp) {
      req.session.err = "This Field is required";
    }
    if (req.session.err) {
      req.session.rTime = req.body.rTime;
      return res.status(200).redirect("/otp-verification");
    }
    const response = await forgotuserOtpVerify(req, res);

    if (response) {
      deleteOtpFromdb(req.session.forgotOtpResend);
      req.session.verifyChangePassPage = true;
      res.status(200).redirect("/reset-password");
    }
  } catch (err) {
    console.log("Internal delete error", err);
    res.status(500).send("Error while quering data err");
  }
};

exports.forgotOtpResend = async (req, res) => {
  try {
    deleteOtpFromdb(req.session.forgotOtpResend);
    forgotOtpSendOtpMail(req, res, "/otp-verification");

    delete req.session.err;
    delete req.session.rTime;
  } catch (err) {
    console.log("Resend Mail err:", err);
  }
};



exports.updatepassword = async (req, res) => {
  console.log(req.session.forgotuser);

  const hashedpassword = await bcrypt.hash(req.body.password, 10);

  const updateuser = await User.updateOne(
    { email: req.session.forgotuser },
    { $set: { password: hashedpassword } }
  );
  console.log(updateuser);
  res.redirect("/signin");
};


exports.signOut = async (req, res) => {
  req.session.isUserAuth = false;
  req.session.isUserAuthenticated = false;
  delete req.session.email
  delete req.session.phone
  delete req.session.userId
}

