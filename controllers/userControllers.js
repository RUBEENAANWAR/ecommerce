const { response } = require("express");
const express = require("express");
const router = express.Router();
const productHelper = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-helpers");
const { check, validationResult } = require("express-validator");
const productHelpers = require("../helpers/product-helpers");
const { Db } = require("mongodb");
const db = require("../config/connection");
const collections = require("../config/collections");

userHome=async (req, res, next) => {
    let user = req.session.user;
    console.log(user);
    let cartCount = null;
    if (req.session.user) {
      cartCount = await userHelpers.getCartCount(req.session.user._id);
    }
    productHelper.getAllProducts().then((products) => {
      res.render("user/view-products", { products, user, cartCount });
    });
  };

  const userLogin=(req, res) => {
    if (req.session.user) {
      res.redirect("/");
    } else {
      res.render("user/login", { loginErr: req.session.userLoginErr });
      req.session.userLoginErr = false;
    }
  };

  const userSignup=(req, res) => {
    res.render("user/signup");
  };

  const userSignupPost= 
  
  (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    const error1 = errors.errors.find((item) => item.param === "Name") || "";
    const error2 = errors.errors.find((item) => item.param === "Email") || "";
    const error3 =
      errors.errors.find((item) => item.param === "Password") || "";
    const error4 =
      errors.errors.find((item) => item.param === "Mobilenumber") || "";
    console.log(error3.msg);
    if (!errors.isEmpty()) {
      let errors = {
        NameMsg: error1.msg,
        EmailMsg: error2.msg,
        PasswordMsg: error3.msg,
        MobileMsg: error4.msg,
      };
      res.render("user/signup", { errors });
    } else {
      userHelpers.doSignup(req.body).then((response) => {
        req.session.user = response;
        req.session.user.loggedIn = true;
        res.redirect("/otpLoginVerify");
      });
    }
  };

  const userLoginPost=(req, res) => {
    userHelpers.doLogin(req.body).then((response) => {
      if (response.status) {
        req.session.user = response.user;
        req.session.user.loggedIn = true;
        res.redirect("/");
      } else {
        req.session.userLoginErr = "invalid username or password";
        res.redirect("/login");
      }
    });
  }

  const userLogout=(req, res) => {
    req.session.user = null;
    res.redirect("/");
  }

  const otpLoginVerifyGet=(req, res) => {
    userHelpers.otpSignupVerifyGet(req, res);
    req.session.user = response;
    req.session.user.loggedIn = true;
    res.render("user/otpLoginVerify");
  };

  const otpLoginVerifyPost=(req, res) => {
    userHelpers.otpSignupVerifyPost(req, res);
    console.log(response);
    req.session.loggedIn = true;
    req.session.user = response;
    res.redirect("/");
  }
  const otpSignupVerifyGet= (req, res) => {
    userHelpers.otpSignupVerifyGet(req, res);
    res.render("user/otpSignupVerify");
  }
  const otpSignupVerifyPost=(req, res) => {
    userHelpers.otpSignupVerifyPost(req, res);
    console.log(response);
    req.session.loggedIn = true;
    req.session.user = response;
    res.redirect("/");
  }

  const userCart=async (req, res) => {
    let products = await userHelpers.getCartProducts(req.session.user._id);
    let totalValue = await userHelpers.getTotalAmount(req.session.user._id);
    console.log(products);
    res.render("user/cart", { products, user: req.session.user._id, totalValue });
  }

  const addToCart=(req, res) => {
    console.log("api call");
    userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
      res.json({ status: true });
    });
  }
  const categoryBoy=async (req, res) => {
    let boy = await db
      .get()
      .collection(collections.PRODUCT_COLLECTION)
      .find({ category: "BOY" })
      .toArray();
    res.render("user/categoryBoy", { boy });
  };
  const categoryGirl=async (req, res) => {
    let girl = await db
      .get()
      .collection(collections.PRODUCT_COLLECTION)
      .find({ category: "GIRL" })
      .toArray();
    res.render("user/categoryGirl", { girl });
  }
  const changeProductQuantity=(req, res, next) => {
    userHelpers.changeProductQuantity(req.body).then(async (response) => {
      response.total = await userHelpers.getTotalAmount(req.body.user);
      res.json(response);
    });
  }
  const removeCartProduct=(req, res, next) => {
    console.log(req.body);
    userHelpers.removeCartProduct(req.body).then((response) => {
      res.json(response);
    });
  }
  const placeOrderGet=async (req, res) => {
    const total = await userHelpers.getTotalAmount(req.session.user._id);
    res.render("user/place-order", { total, user: req.session.user });
  }

  const placeOrderPost=async (req, res) => {
    console.log(req.body);
    let products = await userHelpers.getCartProductList(req.body.userId);
    console.log(products+1234);
    let totalPrice = await userHelpers.getTotalAmount(req.body.userId);
    userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
      if(req.body['payment-method']==='COD'){
        res.json({ codSuccess: true });
      }else{
        userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
          res.json(response)
        })
      }
     
    });
    console.log(req.body);
  }

  const orderSuccess=(req, res) => {
    res.render("user/order-success", { user: req.session.user });
  }

  const ordersGet=async (req, res) => {
    console.log();
    let orders = await userHelpers.getUserOrders(req.session.user._id);
  
    res.render("user/orders", { user: req.session.user, orders });
  }

  const viewOrderProducts=async (req, res) => {
    let products = await userHelpers.getOrderProducts(req.params.id);
    res.render("user/view-order-products", { user: req.session.user, products });
  }
  const singleProductView= (req, res) => {
    console.log('insingle');
    res.render("user/single-product-view", { user: req.session.user });
  }

  const verifyPaymentPost=(req,res)=>{
    console.log(req.body)
  }

  module.exports={
    userHome,
    userLogin,
    userSignup,
    userSignupPost,
    userLoginPost,
    userLogout,
    otpLoginVerifyGet,
    otpLoginVerifyPost,
    otpSignupVerifyGet,
    otpSignupVerifyPost,
    userCart,
    addToCart,
    categoryBoy,
    categoryGirl,
    changeProductQuantity,
    removeCartProduct,
    placeOrderGet,
    placeOrderPost,
    orderSuccess,
    ordersGet,
    viewOrderProducts,
    singleProductView,verifyPaymentPost

  }