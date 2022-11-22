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

const adminHomePage = (req, res, next) => {
  let adminData = req.session.admin;
  if (!adminData) {
    res.render("admin/login", { admin: true });
  }
  productHelpers.getAllProducts().then((products) => {
    console.log(products);
    res.render("admin/view-products", { admin: true, products, adminData });
  });
};
const addProductGet = async (req, res) => {
  let category = await db
    .get()
    .collection(collections.CATEGORY_COLLECTION)
    .find()
    .toArray();
  console.log(category);
  res.render("admin/add-product", { category });
};
const addBannerPost=(req, res) => {
  productHelpers.addBanner(req.body, (id) => {
    let image = req.files.Image;
    console.log(id);
    image.mv("./public/banner/" + id + ".jpg", (err, done) => {
      if (!err) {
        res.redirect("/admin");
      } else {
        console.log(err);
      }
    });
  });
}


const addProductPost = (req, res) => {
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
};

const deleteProductGet = (req, res) => {
  let proId = req.params.id;
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect("/admin");
  });
};
const editProductGet = async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id);
  console.log(product);
  res.render("admin/edit-product", { product });
};

const editProductPost = (req, res) => {
  console.log(req.params.id);
  let id = req.params.id;
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect("/admin");
    if (req.files) {
      let image = req.files.Image;
      image.mv("./public/product-images/" + id + ".jpg");
    }
  });
};
const adminSignupGet = (req, res) => {
  res.render("admin/admin-signup");
};
const adminSignupPost = (req, res) => {
  adminHelpers.adminSignup(req.body).then((response) => {
    console.log(response);
    req.session.loggedIn = true;
    req.session.admin = response;
    res.redirect("/");
  });
};
const adminLoginGet = (req, res) => {
  if (req.session.admin) {
    res.redirect("/admin");
  } else {
    res.render("admin/login", {
      loginErr: req.session.adminLoginErr,
      admin: true,
    });
    req.session.adminLoginErr = false;
  }
};
const adminLoginPost = (req, res) => {
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
};
const adminViewUsers = function (req, res) {
  adminData=req.session.admin
  userHelpers.getAllUsers().then((users) => {
    res.render("admin/view-users", { admin: true, users,adminData });
  });
};
const adminBlockUser = async (req, res) => {
  userHelpers.blockUser(req.params.id);
  res.redirect("/admin/view-users",{admin:true});
};
const adminUnblockUser = async (req, res) => {
  userHelpers.unblockUser(req.params.id);
  res.redirect("/admin/view-users",{admin:true});
};
const adminLogout = (req, res) => {
  req.session.admin = null;
  res.redirect("/admin/login");
};
const categoryManagement = (req, res) => {
  adminData=req.session.admin
  adminHelpers.getCategory().then((category) => {
    console.log(category);
    res.render("admin/adminCategoryManagement", { admin: true, category,adminData});
  });
};
const addNewcategoryGet = (req, res) => {
  res.render("admin/addNewCategory",{admin:true});
};
const addNewCategoryPost = (req, res) => {
  adminHelpers.addCategory(req.body, (id) => {
    adminHelpers.getCategory().then((category) => {
      console.log(category);
      res.render("admin/adminCategoryManagement", { admin: true, category });
    });
  });
};
const deleteCategory = (req, res) => {
  let categoryId = req.params.id;
  adminHelpers.deleteCategory(categoryId).then((response) => {
    res.redirect("/admin/category-management");
  });
};

const adminOrderManagement=(req,res)=>{
  let adminData=req.session.admin
  adminHelpers.allOrders().then((orders)=>{
    res.render('admin/order-management',{admin:true,orders,adminData})
  }).catch((error)=>{
  })
}

const adminOrderUp=async(req,res)=>{
  let orderId=req.params.orderId
  // console.log("SESSION",req.params.orderId);
  let adminData=req.session.admin
  let proDetails=await userHelpers.getOrderProducts(orderId)
  // console.log("PRODUCT DETILAS123",proDetails);
  adminHelpers.orderDetails(orderId).then((orderDetails)=>{
  // console.log("ORDER DETILAS123",orderDetails);

    res.render("admin/adminOrderView",{admin:true,orderDetails,proDetails,adminData})
  })
}

const cancelOrder=(req,res)=>{
  let orderId=req.params.orderId
  let remark=req.body.remark
  adminHelpers.cancelOrder(orderId,remark).then((response)=>{
    res.redirect('../viewOrderUp/' + orderId)
  }).catch((error)=>{
    console.log(error);
  })
}
// const adminOrderUp=async(req,res)=>{
//   let orderId=req.params.orderId
//   console.log("session--",orderId);
//   console.log(orderId  + "orderId from adminOrderUp")  
//   let adminData=req.session.admin
//    let proDetails=await userHelpers.getOrderProducts(orderId)
//    console.log("deatilsa1233",proDetails);
//   adminHelpers.orderDetails(orderId).then((orderDetails)=>{
//    console.log("deatilsa1233",orderDetails);

//     res.render('admin/adminOrderView',{admin:true,orderDetails,proDetails,adminData})
//   }).catch((errors)=>{

//   })
// }

// const cancelOrder=(req,res)=>{
//   let orderId=req.params.orderId
//   let remark=req.body.remark
//   adminHelpers.cancelOrder(orderId,remark).then((response)=>{
//     res.redirect('../viewOrderUp/'+orderId)
//   }).catch((error)=>{
//     console.log(error)
//   })
// }

module.exports = {
  adminHomePage,
  addProductGet,
  addProductPost,
  deleteProductGet,
  editProductGet,
  editProductPost,
  adminSignupGet,
  adminSignupPost,
  adminLoginGet,
  adminLoginPost,
  adminViewUsers,
  adminBlockUser,
  adminUnblockUser,
  adminLogout,
  categoryManagement,
  addNewcategoryGet,
  addNewCategoryPost,
  deleteCategory,
  adminOrderManagement,
  adminOrderUp,
  cancelOrder,
  addBannerPost
};
