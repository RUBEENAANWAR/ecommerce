const express = require("express");
// const{render}=require('../app')
const router = express.Router();
const productHelpers = require("../helpers/product-helpers");
const bodyParser = require("body-parser");
const adminHelpers = require("../helpers/admin-helpers");
const userHelpers = require("../helpers/user-helpers");
const { check, validationResult } = require("express-validator");
const { Db } = require("mongodb");
const collections = require("../config/collections");
const db = require("../config/connection");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const verifyAdminLogin = (req, res, next) => {
  if (req.session.admin.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

router.get("/", (req, res, next) => {
  let adminData = req.session.admin;
  if (!adminData) {
    res.render("admin/login", { admin: true });
  }
  productHelpers.getAllProducts().then((products) => {
    console.log(products);
    res.render("admin/view-products", { admin: true, products, adminData });
  });
});

router.get("/add-product", async (req, res) => {
  let category= await db.get().collection(collections.CATEGORY_COLLECTION).find().toArray()
  console.log(category)
  res.render("admin/add-product",{category});
});
router.post("/add-product", (req, res) => {
  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.Image;
    console.log(id);
    image.mv("./public/product-images/" + id + ".jpg", (err, done) => {
      if (!err) {
        res.redirect("/admin");
      } else {
        console.log(err);
      }
    });
  });
});

router.get("/delete-product/:id", (req, res) => {
  let proId = req.params.id;
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect("/admin");
  });
});

router.get("/edit-product/:id", async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id);
  console.log(product);
  res.render("admin/edit-product", { product });
});

router.post("/edit-product/:id", (req, res) => {
  console.log(req.params.id);
  let id = req.params.id;
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect("/admin");
    if (req.files.Image) {
      let image = req.files.Image;
      image.mv("./public/product-images/" + id + ".jpg");
    }
  });
});

router.get("/admin-signup", (req, res) => {
  res.render("admin/admin-signup");
});

router.post("/admin-signup", (req, res) => {
  adminHelpers.adminSignup(req.body).then((response) => {
    console.log(response);
    req.session.loggedIn = true;
    req.session.admin = response;
    res.redirect("/");
  });
});

router.get("/login", (req, res) => {
  if (req.session.admin) {
    res.redirect("/admin");
  } else {
    res.render("admin/login", {
      loginErr: req.session.adminLoginErr,
      admin: true,
    });
    req.session.adminLoginErr = false;
  }
});

router.post("/login", (req, res) => {
  adminHelpers.adminLogin(req.body).then((response) => {
    if (response.status) {
      req.session.admin = response.admin;
      req.session.admin.loggedIn = true;
      res.redirect("/admin");
    } else {
      req.session.adminLoginErr = "invalid credentials";
      res.redirect("/admin/login");
    }
  });
});

router.get("/view-users", function (req, res) {
  userHelpers.getAllUsers().then((users) => {
    res.render("admin/view-users", { admin: true, users });
  });
});

router.get("/block-user/:id", async (req, res) => {
  userHelpers.blockUser(req.params.id);
  res.redirect("/admin/view-users");
});

router.get("/unblock-user/:id", async (req, res) => {
  userHelpers.unblockUser(req.params.id);
  res.redirect("/admin/view-users");
});

router.get("/logout", (req, res) => {
  req.session.admin = null;
  res.redirect("/admin/login");
});

router.get('/category-management',(req,res)=>{
  adminHelpers.getCategory().then((category)=>{
    console.log(category);
    res.render("admin/adminCategoryManagement", { admin: true,category});
  });
  })
  router.get('/addNewCategory',(req,res)=>{
    res.render('admin/addNewCategory')
  })

router.post('/addNewCategory',(req,res)=>{
  adminHelpers.addCategory(req.body,(id)=>{
    adminHelpers.getCategory().then((category)=>{
      console.log(category)
      res.render('admin/adminCategoryManagement', {admin:true,category})
    })
  })
})
router.get("/delete-category/:id", (req, res) => {
  let categoryId = req.params.id;
  adminHelpers.deleteCategory(categoryId).then((response) => {
    res.redirect("/admin/category-management");
  });
});


module.exports = router;
