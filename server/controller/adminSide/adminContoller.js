const axios = require('axios')

var userDb = require("../../model/userSchema");
var Category = require("../../model/categorySchema");
var Item = require("../../model/itemSchema");
const Order = require("../../model/orderSchema");


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

exports.addCategory = async (req, res) => {
  const categoryName = req.body.category;
  const categoryExists = await Category.findOne({
    category: { $regex: new RegExp(categoryName, "i") },
  });
  console.log('hii', req.body);
  if (categoryExists) {
    req.session.categoryerr = "Category already in use";
    return res.redirect("/adminAddCategory");
  }

  const category = new Category({
    category: categoryName,
  });
  category
    .save(category)
    .then((data) => {
      res.redirect("/adminCategoryMange");
    })
    .catch((err) => {
      res.status(400).send({
        message: err.message || "some error occured while creating option ",
      });
    });
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

    // await Item.updateMany(
    //   { category: categorydata[0].category },
    //   { $set: { isCategory: false } }
    // );
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
    // await Item.updateMany(
    //   { category: categorydata[0].category },
    //   { $set: { isCategory: true } }
    // );
    res.status(200).redirect("/unlistCategory");
  }
};

exports.editCategory = async (req, res) => {
  const categoryName = req.body.category
  const editId = req.query.id;
  console.log(req.body, editId);

  try {
    await Category.updateOne(
      { _id: editId },
      { $set: { category: categoryName } }
    );
    res.redirect("/categoryManagement");
  } catch (err) {
    req.session.categoryerr = "Category already in use";
    const referrer = req.get("Referer");
    res.redirect(referrer);
  }
};
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

exports.addItem = (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "hi you entered any thing" });
    return;
  }
  console.log(req);

  const file = req.files;
  const images = file.map((values) => `/uploads/${values.filename}`);
  console.log('dcs');

  // save in db
  const item = new Item({
    item: req.body.item,
    category: req.body.category,
    description: req.body.description,
    price: req.body.price,
    image: images,
  });
  item
    .save(item)
    .then((data) => {
      // console.log("done")
      res.redirect("/itemManagement");
    })
    .catch((err) => {
      res.status(400).send({
        message: err.message || "some error occured while creating option ",
      });
    });
};

exports.edititem = async (req, res) => {
};

exports.edititemShow = async (req, res) => {

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
    // const orders = await Order.find()
    //     .populate('users', 'username')
    //     .select('items totalAmount paymentStatus address.username')
    // const orders = await Order.find();
    const orders = await Order.aggregate([
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