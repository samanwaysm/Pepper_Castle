var userDb = require("../../model/userSchema");
var Category = require("../../model/categorySchema");
var Item = require("../../model/itemSchema");


exports.adminLogin = async (req, res) => {

};

exports.adminLogout = async (req, res) => {

};

//Dashboard
exports.Dashboard = async (req, res, next) => {

};

exports.userManagement = async (req, res) => {

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
    console.log('hii',req.body);
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

