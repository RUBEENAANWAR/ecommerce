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
const verifyLogin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.loggedIn) {
    next();
  } else {
    return res.redirect("/login");
  }
};

//get home page
router.get("/", async (req, res, next) => {
  let user = req.session.user;
  console.log(user);
  let cartCount=null
  if(req.session.user){
  cartCount = await userHelpers.getCartCount(req.session.user._id);
  }
  productHelper.getAllProducts().then((products) => {
    res.render("user/view-products", { products, user, cartCount });
  });
});

router.get("/login", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("user/login", { loginErr: req.session.userLoginErr });
    req.session.userLoginErr = false;
  }
});

router.get("/signup", (req, res) => {
  res.render("user/signup");
});

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
  (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    const error1 = errors.errors.find((item) => item.param === "Name") || "";
    const error2 = errors.errors.find((item) => item.param === "Email") || "";
    const error3 =
      errors.errors.find((item) => item.param === "Password") || "";
    console.log(error3.msg);
    if (!errors.isEmpty()) {
      let errors = {
        NameMsg: error1.msg,
        EmailMsg: error2.msg,
        PasswordMsg: error3.msg,
      };
      res.render("user/signup", { errors });
    } else {
      userHelpers.doSignup(req.body).then((response) => {
        req.session.user = response;
        req.session.user.loggedIn = true;
        res.redirect("/otpLoginVerify");
      });
    }
  }
);
router.post("/login", (req, res) => {
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
});

router.get("/logout", (req, res) => {
  req.session.user = null;
  res.redirect("/");
});

router.get("/otpLoginVerify", (req, res) => {
  userHelpers.otpSignupVerifyGet(req, res);
  req.session.user = response;
  req.session.user.loggedIn = true;
  res.render("user/otpLoginVerify");
});
router.post("/otpLoginVerify", (req, res) => {
  userHelpers.otpSignupVerifyPost(req, res);
  console.log(response);
  req.session.loggedIn = true;
  req.session.user = response;
  res.redirect("/");
});

router.get("/otpSignupVerify", (req, res) => {
  userHelpers.otpSignupVerifyGet(req, res);
  res.render("user/otpSignupVerify");
});

router.post("/otpSignupVerify", (req, res) => {
  userHelpers.otpSignupVerifyPost(req, res);
  console.log(response);
  req.session.loggedIn = true;
  req.session.user = response;
  res.redirect("/");
});

router.get("/cart", verifyLogin, async (req, res) => {
  let products = await userHelpers.getCartProducts(req.session.user._id);
  console.log(products);
  res.render("user/cart", { products, user: req.session.user });
});
router.get("/add-to-cart/:id", (req, res) => {
 console.log('api call')
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => { 
    //res.redirect("/cart");
    res.json({status:true})
  });
});

router.get("/categoryBoy", async (req, res) => {
  let boy = await db
    .get()
    .collection(collections.PRODUCT_COLLECTION)
    .find({ category: "BOY" })
    .toArray();
  res.render("user/categoryBoy", { boy });
});
router.get("/categoryGirl", async (req, res) => {
  let girl = await db
    .get()
    .collection(collections.PRODUCT_COLLECTION)
    .find({ category: "GIRL" })
    .toArray();
  res.render("user/categoryGirl", { girl });
});

router.post('/change-product-quantity',(req,res,next)=>{
  userHelpers.changeProductQuantity(req.body).then((response)=>{
    res.json(response)
  })
})
module.exports = router;
