const axios = require('axios')

var userDb = require("../../model/userSchema");
var Category = require("../../model/categorySchema");
var Item = require("../../model/itemSchema");
const Order = require("../../model/orderSchema");

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


exports.adminLogin = async (req, res) => {
  const admin = {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASS,
  };
  if (req.body.email === admin.email && req.body.password === admin.password) {
    req.session.isAdminAuthenticated = true;
    res.redirect("/dashboard");
  } else {
    if (req.body.email !== admin.email) {
      req.session.adminEmailErr = "Invalid Email";
      return res.redirect("/adminlogin");
    }
    if (req.body.password !== admin.password) {
      req.session.adminPassErr = "Invalid Password";
      return res.redirect("/adminlogin");
    }
  }
};

exports.adminLogout = async (req, res) => {
  req.session.isAdminAuthenticated = false;
  return res.redirect("/adminlogin");
};

//Dashboard
exports.Dashboard = async (req, res, next) => {

};

exports.userManagement = async (req, res) => {
  try {
    const users = await userDb.find();
    console.log(users);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users: ", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.searchUsers = async (req, res) => {
  const { query } = req.query;
  try {
    const users = await userDb.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error searching users: ", error);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.updateUserStatus = async (req, res) => {
  try {
    const { userId, action } = req.body;
    const isBlocked = action === 'block' ? true : false;
    const updatedUser = await userDb.findByIdAndUpdate(userId, { isBlocked: isBlocked });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully` });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.userBlock = async (req, res) => {

};
exports.userunBlock = async (req, res) => {

};

// cateogary managment

// exports.addCategory = async (req, res) => {
//   const categoryName = req.body.category;
//   const categoryExists = await Category.findOne({
//     category: { $regex: new RegExp(categoryName, "i") },
//   });
//   console.log('hii', req.body);
//   if (categoryExists) {
//     return res.redirect("/addCategory");
//   }

//   const category = new Category({
//     category: categoryName,
//   });
//   category
//     .save(category)
//     .then((data) => {
//       res.redirect("/categoryMangement");
//     })
//     .catch((err) => {
//       res.status(400).send({
//         message: err.message || "some error occured while creating option ",
//       });
//     });
// };

exports.addCategory = async (req, res) => {
  const categoryName = req.body.category ? req.body.category.trim() : ""; // Trim spaces
  const errors = {};

  // Validate input
  if (!categoryName || categoryName === "") {
    errors.category = "Category name is required.";
  }

  try {
    // Check if the category already exists (case-insensitive)
    const categoryExists = await Category.findOne({
      category: { $regex: new RegExp(`^${categoryName}$`, "i") }, // Case-insensitive check
    });

    if (categoryExists) {
      errors.category = "Category name is already in use.";
    }

    // If validation errors, store them in session and redirect
    if (Object.keys(errors).length > 0) {
      req.session.errors = errors; // Store errors in session
      return res.redirect("/addCategory");
    }

    // Create and save new category if validation passes
    const category = new Category({
      category: categoryName, // Save as it is (no capitalization)
    });

    await category.save();
    req.session.success = "Category added successfully."; // Optional success message
    res.redirect("/categoryManagement");
  } catch (err) {
    console.error(err);
    req.session.errors = { general: "An error occurred. Please try again." }; // General error message
    res.redirect("/addCategory");
  }
};



exports.CategoryManagementShow = async (req, res) => {
  const categoryList = await Category.find({ status: true });
  res.send(categoryList);
};



exports.UnlistCategoryShow = async (req, res) => {
  const UnlistCategory = await Category.find({ status: false });
  res.send(UnlistCategory);
};

exports.unlistCategory = async (req, res) => {
  const id = req.query.id;
  console.log(id);

  const categorydata = await Category.find({ _id: id });
  if (
    categorydata &&
    categorydata.length > 0 &&
    categorydata[0].status === true
  ) {
    await Category.updateOne({ _id: id }, { $set: { status: false } });

    await Item.updateMany(
      { category: categorydata[0].category },
      { $set: { isCategory: false } }
    );
    res.status(200).redirect("/categoryManagement");
  }
};

exports.listCategory = async (req, res) => {
  const id = req.query.id;
  const categorydata = await Category.find({ _id: id });
  if (
    categorydata &&
    categorydata.length > 0 &&
    categorydata[0].status === false
  ) {
    await Category.updateOne({ _id: id }, { $set: { status: true } });
    await Item.updateMany(
      { category: categorydata[0].category },
      { $set: { isCategory: true } }
    );
    res.status(200).redirect("/unlistCategory");
  }
};

exports.editCategory = async (req, res) => {
  const categoryName = req.body.category ? req.body.category.trim() : ""; // Trim spaces
  const editId = req.query.id;
  const errors = {};

  // Validate input
  if (!categoryName || categoryName === "") {
    errors.category = "Category name is required.";
  }

  try {
    // Check if category with the same name already exists (case-insensitive, excluding the current category being edited)
    const existingCategory = await Category.findOne({
      _id: { $ne: editId },
      category: { $regex: new RegExp(`^${categoryName}$`, 'i') }, // Case-insensitive check
    });
    
    if (existingCategory) {
      errors.category = "Category name is already in use.";
    }

    // If there are validation errors, store them in session and redirect
    if (Object.keys(errors).length > 0) {
      req.session.errors = errors; // Store errors in session
      const referrer = req.get("Referer"); // Get the page the request came from
      return res.redirect(referrer);
    }

    // Proceed with updating the category if validation passes
    await Category.updateOne(
      { _id: editId },
      { $set: { category: categoryName } }
    );

    req.session.success = "Category updated successfully."; // Optional success message
    res.redirect("/categoryManagement");
  } catch (err) {
    console.error(err);
    req.session.errors = { general: "An error occurred. Please try again." }; // General error message
    const referrer = req.get("Referer"); 
    res.redirect(referrer);
  }
};


// exports.editCategory = async (req, res) => {
//   const categoryName = req.body.category
//   const editId = req.query.id;
//   console.log(req.body, editId);

//   try {
//     await Category.updateOne(
//       { _id: editId },
//       { $set: { category: categoryName } }
//     );
//     res.redirect("/categoryManagement");
//   } catch (err) {
//     req.session.categoryerr = "Category already in use";
//     const referrer = req.get("Referer");
//     res.redirect(referrer);
//   }
// };
exports.editCategoryShow = async (req, res) => {
  const categoryEditId = req.query.id;
  const data = await Category.findOne({ _id: categoryEditId })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `cannot  category with ${id}.may be not category found`,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

// item managment

// exports.addItem = (req, res) => {
//   const file = req.files;
//   const images = file.map((values) => `/uploads/${values.filename}`);
//   console.log('dcs');

//   const item = new Item({
//     item: req.body.item,
//     category: req.body.category,
//     description: req.body.description,
//     price: req.body.price,
//     image: images,
//   });
//   item
//     .save(item)
//     .then((data) => {
//       res.redirect("/itemManagement");
//     })
//     .catch((err) => {
//       res.status(400).send({
//         message: err.message || "some error occured while creating option ",
//       });
//     });
// };

// exports.addItem = async (req, res) => {
//   const file = req.files;
//   const images = file ? file.map((values) => `/uploads/${values.filename}`) : [];
//   const { item, category, description, price } = req.body;
//   const errors = {};

//   // Validate input fields
//   if (!item || item.trim() === "") {
//       errors.item = "Item name is required.";
//   }
//   if (!category || category.trim() === "") {
//       errors.category = "Category is required.";
//   }
//   if (!description || description.trim() === "") {
//       errors.description = "Description is required.";
//   }
//   if (!price || isNaN(price) || Number(price) <= 0) {
//       errors.price = "Valid price is required.";
//   }

//   // Check for image format
//   const allowedImageFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
//   if (file && file.length > 0) {
//       const invalidImages = file.filter(file => !allowedImageFormats.includes(file.mimetype));
//       if (invalidImages.length > 0) {
//           errors.images = "Only JPG, PNG, and GIF formats are allowed for images.";
//       }
//   }

//   // Check if item already exists in the database
//   const existingItem = await Item.findOne({
//     item: { $regex: new RegExp(`^${item.trim()}$`, 'i') } // Case-insensitive check
//   });
//   if (existingItem) {
//       errors.item = "An item with this name already exists.";
//   }

//   // If there are errors, redirect back with error messages
//   if (Object.keys(errors).length > 0) {
//       req.session.errors = errors; // Store errors in session
//       return res.redirect('/addItem'); // You can redirect to a different route if needed
//   }

//   try {
//       // Create new item
//       const newItem = new Item({
//           item: item.trim(), // Trim spaces
//           category: category.trim(),
//           description: description.trim(),
//           price: Number(price), // Ensure price is stored as a number
//           image: images,
//       });

//       // Save the item to the database
//       await newItem.save();
//       req.session.success = "Item added successfully."; // Optional: Success message
//       res.redirect("/itemManagement");
//   } catch (err) {
//       console.error(err);
//       req.session.errors = { general: "An error occurred. Please try again." }; // General error
//       res.redirect('/itemManagement');
//   }
// };

exports.addItem = async (req, res) => {
  const file = req.files;
  const images = file ? file.map((values) => `/uploads/${values.filename}`) : [];
  const { item, category, description, price } = req.body;
  const errors = {};

  // Validate input fields
  if (!item || item.trim() === "") {
      errors.item = "Item name is required.";
  }
  if (!category || category.trim() === "") {
      errors.category = "Category is required.";
  }
  if (!description || description.trim() === "") {
      errors.description = "Description is required.";
  }
  if (!price || isNaN(price) || Number(price) <= 0) {
      errors.price = "Valid price is required.";
  }

  // Check if images are provided
  if (images.length === 0) {
      errors.image = "image is required.";
  }

  // Check for image format
  const allowedImageFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
  if (file && file.length > 0) {
      const invalidImages = file.filter(file => !allowedImageFormats.includes(file.mimetype));
      if (invalidImages.length > 0) {
          errors.images = "Only JPG, PNG, and GIF formats are allowed for images.";
      }
  }

  // Check if item already exists in the database
  const existingItem = await Item.findOne({
    item: { $regex: new RegExp(`^${item.trim()}$`, 'i') } // Case-insensitive check
  });
  if (existingItem) {
      errors.item = "An item with this name already exists.";
  }

  // If there are errors, redirect back with error messages
  if (Object.keys(errors).length > 0) {
      req.session.errors = errors; // Store errors in session
      return res.redirect('/addItem'); // You can redirect to a different route if needed
  }

  try {
      // Create new item
      const newItem = new Item({
          item: item.trim(), // Trim spaces
          category: category.trim(),
          description: description.trim(),
          price: Number(price), // Ensure price is stored as a number
          image: images,
      });

      // Save the item to the database
      await newItem.save();
      req.session.success = "Item added successfully."; // Optional: Success message
      res.redirect("/itemManagement");
  } catch (err) {
      console.error(err);
      req.session.errors = { general: "An error occurred. Please try again." }; // General error
      res.redirect('/itemManagement');
  }
};

exports.editItem = async (req, res) => {
  const editId = req.query.id;
  const file = req.files;
  const images = file ? file.map((values) => `/uploads/${values.filename}`) : [];
  const { item, category, description, price } = req.body;
  const errors = {};

  // Validate input fields
  if (!item || item.trim() === "") {
      errors.item = "Item name is required.";
  }
  if (!category || category.trim() === "") {
      errors.category = "Category is required.";
  }
  if (!description || description.trim() === "") {
      errors.description = "Description is required.";
  }
  if (!price || isNaN(price) || Number(price) <= 0) {
      errors.price = "Valid price is required.";
  }

  // Check for image format
  const allowedImageFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
  if (file && file.length > 0) {
      const invalidImages = file.filter(file => !allowedImageFormats.includes(file.mimetype));
      if (invalidImages.length > 0) {
          errors.images = "Only JPG, PNG, and GIF formats are allowed for images.";
      }
  }

  // Check if item already exists in the database (excluding the current item)
  const existingItem = await Item.findOne({
    item: { $regex: new RegExp(`^${item.trim()}$`, 'i') }, // Case-insensitive check
    _id: { $ne: editId }, // Exclude the current item
  });
  if (existingItem) {
      errors.item = "An item with this name already exists.";
  }

  // If there are errors, redirect back with error messages
  if (Object.keys(errors).length > 0) {
      req.session.errors = errors; // Store errors in session
      return res.redirect(`/editItem?id=${editId}`);
  }

  try {
      // Update item details
      await Item.updateOne(
          { _id: editId },
          {
              $set: {
                  item: item.trim(), // Trim spaces
                  category: category.trim(),
                  description: description.trim(),
                  price: Number(price) // Ensure price is stored as a number
              }
          }
      );

      // Update images if provided
      if (images.length > 0) {
          await Item.updateOne({ _id: editId }, { $set: { image: images } });
      }

      req.session.success = "Item updated successfully."; // Optional: Success message
      res.redirect('/itemManagement');
  } catch (error) {
      console.error(error);
      req.session.errors = { general: "An error occurred. Please try again." }; // General error
      res.redirect(`/itemManagement?id=${editId}`);
  }
};

// exports.editItem = async (req, res) => {
//   const editId = req.query.id;
//   const file = req.files; 
//   const images = file.map((values) => `/uploads/${values.filename}`);
//   try {
//         await Item.updateOne(
//           { _id: editId },
//           { $set: { 
//             item: req.body.item,
//             category: req.body.category,
//             description: req.body.description,
//             price: req.body.price 
//           } }
//         );
//         if (images.length == 0) {
//           return res.redirect("/itemManagement");
//         }
//         if (images.length > 0) {
//           await Item.updateOne({ _id: editId }, { $set: { image: images } });
//           res.status(200).redirect('/itemManagement');
//         }
//       } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };

exports.editItemShow = async (req, res) => {
  const { id } = req.query; // Get the ID from the request parameters
  console.log(id);

  try {
      // Find the item by ID
      const item = await Item.findById(id);

      if (!item) {
          return res.status(404).json({ message: 'Item not found' });
      }

      console.log(item);
      
      // Return the item data to the client
      res.status(200).json(item);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }

};

exports.itemManagementShow = async (req, res) => {
  const itemList = await Item.find({
    $and: [{ listed: true }, { isCategory: true }],
  });
  res.send(itemList);
};

exports.unlistItemShow = async (req, res) => {
  const itemList = await Item.find({
    $and: [{ listed: false }, { isCategory: true }],
  });
  res.send(itemList);
};

exports.unlistItem = async (req, res) => {
  const id = req.query.id;
  const itemdata = await Item.find({ _id: id });
  if (itemdata && itemdata.length > 0 && itemdata[0].listed === true) {
    await Item.updateOne({ _id: id }, { $set: { listed: false } });
    res.status(200).redirect("/itemManagement");
  }
};

exports.listItem = async (req, res) => {
  const id = req.query.id;
  const itemdata = await Item.find({ _id: id });
  if (
    itemdata &&
    itemdata.length > 0 &&
    itemdata[0].listed === false
  ) {
    await Item.updateOne({ _id: id }, { $set: { listed: true } });
    res.status(200).redirect("/unlistItem");
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    // const orders = await Order.aggregate([
    //   {
    //     $lookup: {
    //       from: 'users',
    //       localField: 'user',
    //       foreignField: '_id',
    //       as: 'userDetails'
    //     }
    //   },
    //   {
    //     $unwind: '$userDetails'
    //   },
    //   {
    //     $project: {
    //       _id: 1,
    //       orderId: 1,
    //       username: '$userDetails.username',
    //       items: 1,
    //       totalAmount: 1,
    //       paymentStatus: 1,
    //       status: 1
    //     }
    //   }
    // ]);
    const orders = await Order.aggregate([
      {
        $match: {
          completed: true // Filter to only get orders where completed is true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $project: {
          _id: 1,
          orderId: 1,
          username: '$userDetails.username',
          items: 1,
          totalAmount: 1,
          paymentStatus: 1,
          status: 1
        }
      }
    ]);

    console.log(orders);
    
    res.status(200).json({
      success: true,
      orders: orders.map(order => ({
        orderId: order.orderId,
        username: order.username,
        items: order.items.map(item => ({
          itemName: item.item,
          quantity: item.quantity
        })),
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        status: order.status
      }))
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders"
    });
  }
};

exports.getOrderDetails = async (req, res) => {
  const { orderId } = req.query;
  try {
    const orderDetails = await Order.aggregate([
      {
        $match: { orderId: orderId }
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 0,
          orderId: 1,
          items: 1,
          address: 1,
          totalAmount: 1,
          paymentStatus: 1,
          status: 1,
          createdAt: 1,
          username: "$userDetails.username",
          email: "$userDetails.email",
          phone: "$userDetails.phone"
        }
      }
    ]);

    // console.log('order-detail',orderDetails);


    if (orderDetails.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const singaporeTimeZone = 'Asia/Singapore';
    const createdAt = new Date(orderDetails[0].createdAt);
    const formattedDate = new Intl.DateTimeFormat('en-SG', {
      timeZone: singaporeTimeZone,
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(createdAt);

    const formattedTime = new Intl.DateTimeFormat('en-SG', {
      timeZone: singaporeTimeZone,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    }).format(createdAt);

    const formattedOrder = {
      ...orderDetails[0],
      createdAt: {
        date: formattedDate,
        time: formattedTime
      }
    };

    return res.json({ success: true, order: formattedOrder });
  } catch (error) {
    console.error('Error fetching order details:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { orderId, status } = req.body;

  try {
      const order = await Order.findOneAndUpdate(
          { orderId: orderId },
          { status: status },
          { new: true }
      );
      if(order.status === 'Cancelled' && order.paymentMethod === 'online' && order.paymentStatus === 'success' && order.completed === true ){
        refundPayment(order.payment_intent)
      }

      if (!order) {
          return res.status(404).json({ message: 'Order not found' });
      }

      return res.status(200).json({ message: 'Order status updated successfully', order });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error updating order status' });
  }
}
const refundPayment = async (paymentIntentId) => {
// exports.refundPayment = async (req, res) => {
  // const { paymentIntentId } = req.body;  // Only pass the paymentIntentId

  try {
      // Retrieve the PaymentIntent to validate and get the amount
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (!paymentIntent) {
          return res.status(404).json({ success: false, message: 'PaymentIntent not found' });
      }

      // Validate that the payment has been captured and was successful
      if (paymentIntent.status !== 'succeeded') {
          return res.status(400).json({ success: false, message: 'Payment has not been captured or succeeded yet.' });
      }

      // Fetch the total amount received from the PaymentIntent
      const amountToRefund = paymentIntent.amount_received;

      // Create a refund for the total captured amount
      const refund = await stripe.refunds.create({
          payment_intent: paymentIntentId,  // Use the PaymentIntent ID
          amount: amountToRefund,  // Refund the full amount received
      });
      console.log(refund, 'refund_is success');
      

      // return res.status(200).json({
      //     success: true,
      //     message: 'Refund issued successfully',
      //     refund,
      // });
  } catch (error) {
      console.error('Error issuing refund:', error);
      // return res.status(500).json({ success: false, message: 'Error issuing refund', error: error.message });
  }
};





  // const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${11.805032337467159},${75.54574386975459}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

  //   const response = await axios.get(url);
  //   const results = response.data.results;
  //   console.log('-->url-->',response);
  //   return results
    

  //   if (results.length > 0) {
  //     const addressComponents = results[0].address_components;
  //     const postalCode = addressComponents.find(component => component.types.includes('postal_code'));

  //     if (postalCode) {
  //       return res.status(200).json({
  //         message: 'Pincode found',
  //         pincode: postalCode.long_name
  //       });
  //     } else {
  //       return res.status(404).json({ message: 'Pincode not found' });
  //     }
  //   } else {
  //     return res.status(404).json({ message: 'No results found' });
  //   }