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
const fs = require("fs");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const adminControllers = require("../controllers/adminControllers");
const verifyAdminLogin = (req, res, next) => {
  if (req.session.admin.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

router.get("/", adminControllers.adminHomePage);

router.get("/add-product", adminControllers.addProductGet);
router.post("/add-product");

router.get("/delete-product/:id", adminControllers.deleteProductGet);

router.get("/edit-product/:id", adminControllers.editProductGet);

router.post("/edit-product/:id", adminControllers.editProductPost);

router.get("/admin-signup", adminControllers.adminSignupGet);

router.post("/admin-signup", adminControllers.adminSignupPost);

router.get("/login", adminControllers.adminLoginGet);

router.post("/login", adminControllers.adminLoginPost);

router.get("/view-users", adminControllers.adminViewUsers);

router.get("/block-user/:id", adminControllers.adminBlockUser);

router.get("/unblock-user/:id", adminControllers.adminUnblockUser);

router.get("/logout", adminControllers.adminLogout);

router.get("/category-management", adminControllers.categoryManagement);
router.get("/addNewCategory", adminControllers.addNewcategoryGet);

router.post("/addNewCategory", adminControllers.addNewCategoryPost);
router.get("/delete-category/:id", adminControllers.deleteCategory);

module.exports = router;
