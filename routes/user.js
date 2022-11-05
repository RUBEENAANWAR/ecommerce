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
const userControllers = require("../controllers/userControllers");
const verifyLogin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.loggedIn) {
    next();
  } else {
    return res.redirect("/login");
  }
};

//get home page
router.get("/", userControllers.userHome);

router.get("/login", userControllers.userLogin);

router.get("/signup", userControllers.userSignup);

router.post(
  "/signup",
  check("Name").notEmpty().withMessage("Please enter a Name"),
  check("Email").notEmpty().withMessage("Please enter a email"),
  check("Email")
    .matches(/^\w+([\._]?\w+)?@\w+(\.\w{2,3})(\.\w{2})?$/)
    .withMessage("Username must be a valid email id"),
  check("Password")
    .matches(/[\w\d!@#$%^&*?]{5,}/)
    .withMessage("Password must contain at least five characters"),
  check("Password")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter"),
  check("Password")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter"),
  check("Password")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
  check("Password")
    .matches(/[!@#$%^&*?]/)
    .withMessage("Password must contain at least one special character"),
  check("Mobilenumber")
    .matches(/[\d]{10}/)
    .withMessage("Please enter a valid mobile number"),
  check("Mobilenumber")
    .matches(/^[6-9][\d]{9}/)
    .withMessage("Please enter a valid mobile number"),

  userControllers.userSignupPost
);

router.post("/login", userControllers.userLoginPost);

router.get("/logout", userControllers.userLogout);

router.get("/otpLoginVerify", userControllers.otpLoginVerifyGet);

router.post("/otpLoginVerify", userControllers.otpLoginVerifyPost);

router.get("/otpSignupVerify", userControllers.otpSignupVerifyGet);

router.post("/otpSignupVerify", userControllers.otpSignupVerifyPost);

router.get("/cart", verifyLogin, userControllers.userCart);
router.get("/add-to-cart/:id", userControllers.addToCart);

router.get("/categoryBoy", userControllers.categoryBoy);
router.get("/categoryGirl", userControllers.categoryGirl);

router.post("/change-product-quantity", userControllers.changeProductQuantity);

router.post("/remove-cart-product", userControllers.removeCartProduct);

router.get("/place-order", verifyLogin, userControllers.placeOrderGet);

router.post("/place-order", verifyLogin, userControllers.placeOrderPost);

router.get("/order-success", userControllers.orderSuccess);

router.get("/orders", userControllers.ordersGet);

router.get("/view-order-products/:id", userControllers.viewOrderProducts);

router.get("/single-product-view", userControllers.singleProductView);

router.post("/verify-payment", userControllers.verifyPaymentPost);

module.exports = router;
