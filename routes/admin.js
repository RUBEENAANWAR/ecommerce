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
  if (req.session && req.session.admin && req.session.admin.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

router.get("/", adminControllers.adminHomePage);

router.get("/add-product", adminControllers.addProductGet);
router.post("/add-product",adminControllers.addProductPost);

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

router.get("/order-management", adminControllers.adminOrderManagement);

// router.get('/viewOrderUp/:orderId',verifyAdminLogin,adminControllers.adminOrderUp)

// router.get('/cancelOrder/:orderId',adminControllers.cancelOrder)
router.get('/viewOrderUp/:orderId',verifyAdminLogin,adminControllers.adminOrderUp)

router.post("/cancelOrder/:orderId",adminControllers.cancelOrder)

router.post("/orderStatusUpdate/:orderId",(req,res)=>{
  let orderId=req.params.orderId
  let status=req.body.status

  adminHelpers.updateOrderStatus(orderId,status).then((response)=>{
    res.redirect("../viewOrderUp/"+orderId)
  }).catch((error)=>{
    console.log(error);
  })
})

router.get('/sales-report',(req,res)=>{
  res.render('admin/salesReport')
})

module.exports = router;
