var userDb = require("../../model/userSchema");
var Category = require("../../model/categorySchema");
var Item = require("../../model/itemSchema");


exports.adminLoginCheck = async (req, res) => {

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
    const categoryName = req.body.categoryName;
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

};

exports.unlistCategory = async (req, res) => {

};

exports.listCategory = async (req, res) => {
};

exports.editCategory = async (req, res) => {
  const categoryName = req.body.categoryName
  const editId = req.query.id;
  console.log(req.body, editId);
  
  try {
    await Category.updateOne(
      { _id: editId },
      { $set: { category: categoryName } }
    );
    res.redirect("/adminCategoryMange");
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
          res.redirect("/adminItemManagement");
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

};

exports.unlistitem = async (req, res) => {

};

exports.listitem = async (req, res) => {

};

