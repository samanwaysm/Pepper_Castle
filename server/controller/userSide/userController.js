const bcrypt = require("bcrypt");
const mongoose = require("mongoose");



const User = require("../../model/userSchema");
const Category = require("../../model/categorySchema");
const Item = require("../../model/itemSchema");
const AddressDb = require("../../model/addressSchema")


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
  console.log('loginnnn');
  
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



