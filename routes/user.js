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

// router.get("/orders", verifyLogin,userControllers.ordersGet);

router.get("/view-order-products/:id", userControllers.viewOrderProducts);

// router.get("/single-product-view", userControllers.singleProductView);
router.get('/single-product-view',async(req,res)=>{
  let id = req.query.id;
  console.log(id);
  let product=await productHelper.singleProductView(id)
  console.log(product);

  res.render('user/single-product-view',{product})
})

router.get('/cancelOrder/:orderId',verifyLogin,(req,res)=>{
  let orderId=req.params.orderId
  userHelpers.cancelOrder(orderId).then((response)=>{
    res.redirect('/orders')
  }).catch((error)=>{
    console.log(error);
  })
})
router.get("/orders", verifyLogin, async (req, res) => {

  let orders = await userHelpers.getUserOrders(req.session.user._id)

  let orders1 = []

  for (let order of orders) {
    order.cancelButton = true
    if (order.status == "Cancelled") {

      order.cancelButton = false
    }
    orders1.push(order)
  }


  res.render('user/orders', { user: req.session.user, orders1 })
})

router.post("/verify-payment",verifyLogin, userControllers.verifyPaymentPost);

router.get('/userProfile',verifyLogin,async(req,res)=>{
  let user=req.session.user
  let cartCount=await userHelpers.getCartCount(user._id)
  let address= await userHelpers.getAddress(user._id)
  res.render('user/userProfile',{user,cartCount,address})
})

router.post('/userAddress/:id', verifyLogin,(req,res)=>{
  let user=req.session.user
  let addressId=req.params.id
  userHelpers.updateAddress(addressId,req.body).then(()=>{
    res.redirect('../userProfile')
  }).catch((error)=>{
    console.log(error)
  })
})

router.post('/userInfoUpdate', verifyLogin, (req, res) => {
  let user = req.session.user
  userHelpers.userInfoUpdate(user._id, req.body).then(() => {
    res.redirect('./userProfile')
  }).catch((error) => {
    //res.redirect('../error')
    //console.log(errors);
  })

})

router.get('/addAddress', verifyLogin,async (req, res) => {
  let user = req.session.user
  let cartCount = await userHelpers.getCartCount(user._id)
  res.render('user/userNewAddress', {user, cartCount })
})

router.post('/addAddress', verifyLogin, async (req, res) => {
  let user = req.session.user
  let details = req.body
  details.userId = user._id;
  details.default = false;
  userHelpers.addAddress(details).then((data) => {
    res.redirect('./userProfile')
  })

})


module.exports = router;
