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

const userHome = async (req, res, next) => {
  let user = req.session.user;
  console.log(user);
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }
  productHelper.getAllProducts().then(async (products) => {
    let banner = await productHelpers.getAllBanner();
    banner[0].active = true; 
    res.render("user/view-products", { products, user, cartCount, banner });
  });
};

const userLogin = (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("user/login", { loginErr: req.session.userLoginErr });
    req.session.userLoginErr = false;
  }
};

const userSignup = (req, res) => {
  res.render("user/signup");
};

const userSignupPost = (req, res) => {
  const errors = validationResult(req);
  console.log(errors);
  const error1 = errors.errors.find((item) => item.param === "Name") || "";
  const error2 = errors.errors.find((item) => item.param === "Email") || "";
  const error3 = errors.errors.find((item) => item.param === "Password") || "";
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

const userLoginPost = (req, res) => {
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
};

const userLogout = (req, res) => {
  req.session.user = null;
  res.redirect("/");
};

// const otpLoginVerifyGet = (req, res) => {
//   userHelpers.otpSignupVerifyGet(req, res);
//   req.session.user = response;
//   req.session.user.loggedIn = true;
//   res.render("user/otpLoginVerify");
// };

const otpLoginVerifyPost = (req, res) => {
  userHelpers.otpSignupVerifyPost(req, res);
  console.log(response);
  req.session.loggedIn = true;
  req.session.user = response;
  res.redirect("/");
};
const otpSignupVerifyGet = (req, res) => {
  userHelpers.otpSignupVerifyGet(req, res);
  res.render("user/otpSignupVerify");
};
const otpSignupVerifyPost = (req, res) => {
  userHelpers.otpSignupVerifyPost(req, res);
  console.log(response);
  req.session.loggedIn = true;
  req.session.user = response;
  res.redirect("/");
};

const userCart = async (req, res) => {
  let products = await userHelpers.getCartProducts(req.session.user._id);
  if (products.length == 0) {
    res.render("user/empty-cart", { user: req.session.user });
  } else {
    let totalValue = await userHelpers.getTotalAmount(req.session.user._id);
    console.log(products);
    res.render("user/cart", {
      products,
      user: req.session.user._id,
      totalValue,
    });
  }
};

const addToCart = (req, res) => {
  console.log("api call");
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true });
  });
};

// const userWishlist=(req,res)=>{
//   let products=userHelpers.getWishlistProducts(req.session.user._id)
//   res.render("user/wishlist",{products,user:req.session.user._id})
// }
// const addToWishlist=(req, res) => {
//   console.log("wishlist call");
//   userHelpers.addToWishlist(req.params.id, req.session.user._id).then(() => {
//     // res.json({ status: true });
//     res.redirect('/')
//   });
// }

const categoryBoy = async (req, res) => {
  let boy = await db
    .get()
    .collection(collections.PRODUCT_COLLECTION)
    .find({ category: "BOY" })
    .toArray();
  res.render("user/categoryBoy", { boy });
};

const categoryGirl = async (req, res) => {
  let girl = await db
    .get()
    .collection(collections.PRODUCT_COLLECTION)
    .find({ category: "GIRL" })
    .toArray();
  res.render("user/categoryGirl", { girl });
};
const changeProductQuantity = (req, res, next) => {
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user);
    res.json(response);
  });
};
const removeCartProduct = (req, res, next) => {
  console.log(req.body);
  userHelpers.removeCartProduct(req.body).then((response) => {
    res.json(response);
  });
};
const placeOrderGet = async (req, res) => {
  const total = await userHelpers.getTotalAmount(req.session.user._id);
  const address = await userHelpers.getAddress(req.session.user._id);
  res.render("user/place-order", { total, user: req.session.user, address });
};

const placeOrderPost = async (req, res) => {
  // console.log(req.body);
  let products = await userHelpers.getCartProductList(req.body.userId);
  // console.log(products + 1234);
  let totalPrice = await userHelpers.getTotalAmount(req.body.userId);
  let address = await userHelpers.getAddress(req.session.user._id);

  userHelpers
    .placeOrder(req.body, products, totalPrice, address)
    .then((orderId) => {
      if (req.body["payment-method"] === "COD") {
        res.json({ codSuccess: true });
      } else {
        userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
          console.log(response);
          res.json(response);
        });
      }
    });
  console.log(req.body);
};

const orderSuccess = (req, res) => {
  res.render("user/order-success", { user: req.session.user });
};

// const ordersGet=async (req, res) => {
//   console.log();
//   let orders = await userHelpers.getUserOrders(req.session.user._id)

//   let orders1 = []

//   for (let order of orders) {
//     order.cancelButton = true
//     if (order.status == "Cancelled") {

//       order.cancelButton = false

//     }
//     orders1.push(order)
//   }
// console.log("asdfg::::",orders1);

//   res.render('user/orders', { user: req.session.user, orders1 });
// }

const viewOrderProducts = async (req, res) => {
  let products = await userHelpers.getOrderProducts(req.params.id);
  res.render("user/view-order-products", { user: req.session.user, products });
};
// const singleProductView= async(req, res) => {
//   let id=req.query.id
//   console.log(id);
//   let product = await productHelper.singleProductView(id);
//   console.log(product);
//   res.render("user/single-product-view",{product});

// }

const verifyPaymentPost = (req, res) => {
  console.log(req.body);
  userHelpers
    .verifyPayment(req.body)
    .then(() => {
      userHelpers.changePaymentStatus(req.body["order[receipt]"]).then(() => {
        console.log("payment successfull");
        res.json({ status: true });
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({ status: false, errMsg: "" });
    });
};

module.exports = {
  userHome,
  userLogin,
  userSignup,
  userSignupPost,
  userLoginPost,
  userLogout,
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
  viewOrderProducts,
  verifyPaymentPost,
  // userWishlist,addToWishlist
};
