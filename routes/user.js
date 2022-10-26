const { response } = require('express');
const express=require('express');
const router=express.Router();
const productHelper=require('../helpers/product-helpers')
const userHelpers=require('../helpers/user-helpers')
const {check,validationResult}=require('express-validator')
const verifyLogin=(req,res,next)=>{
  if(req.session.user.loggedIn){
    next()
  }
  else{
    res.redirect('/login')
  }

}

//get home page
router.get('/',(req,res,next)=>{
  let user=req.session.user
  console.log(user)
    productHelper.getAllProducts().then((products)=>{
     
        res.render('user/view-products',{products,user})
    })
   
})

router.get('/login',(req,res)=>{
  if (req.session.user){
    res.redirect('/')
  }
  else{
    res.render('user/login',{"loginErr":req.session.userLoginErr})
req.session.userLoginErr=false
  }
})

router.get('/signup',(req,res)=>{
    res.render('user/signup')
})

router.post('/signup',
  check('Name').notEmpty()
  .withMessage('Please enter a Name'),
  check('Email').notEmpty()
  .withMessage('Please enter a username'),
  check('Email').matches(/^\w+([\._]?\w+)?@\w+(\.\w{2,3})(\.\w{2})?$/)
  .withMessage("Username must be a valid email id"),
  check('Password').matches(/[\w\d!@#$%^&*?]{8,}/)
  .withMessage("Password must contain at least eight characters"),
  check('Password').matches(/[a-z]/)
  .withMessage("Password must contain at least one lowercase letter"),
  check('Password').matches(/[A-Z]/)
  .withMessage("Password must contain at least one uppercase letter"),
  check('Password').matches(/\d/)
  .withMessage("Password must contain at least one number"),
  check('Password').matches(/[!@#$%^&*?]/)
  .withMessage("Password must contain at least one special character"),
 (req, res) => {
      const errors = validationResult(req);
      console.log(errors)
      var error1 = errors.errors.find(item => item.param === 'Name') || '';
      var error2 = errors.errors.find(item => item.param === 'Email') || '';
      var error3 = errors.errors.find(item => item.param === 'Password') || '';
      console.log(error3.msg);
      if (!errors.isEmpty()) {
        let errors = { NameMsg: error1.msg, EmailMsg: error2.msg, PasswordMsg: error3.msg }
        res.render('user/signup', {errors} );
    } else {
          userHelpers.doSignup(req.body).then((response) => {
          req.session.user = response
          req.session.user.loggedIn = true;
          res.redirect('/otpLoginVerify')
  })
    }
})
router.post('/login',(req,res)=>{
userHelpers.doLogin(req.body).then((response)=>{
  if(response.status){
    req.session.user=response.user
    req.session.user.loggedIn=true
    res.redirect('/')
  }else{
    req.session.userLoginErr="invalid username or password"
    res.redirect("/login")
  }
})
})

router.get("/logout",(req,res)=>{
  req.session.user=null
  res.redirect("/")
})

router.get("/cart",verifyLogin,(req,res,next)=>{
  res.render('user/cart')
})
router.get('/otpLoginVerify',(req,res)=>{
  res.render('user/otpLoginVerify')
})
router.post('/otpLoginVerify',(req,res)=>{
  userHelpers.otpSignupVerifyPost(req,res) 
  console.log(response)
  req.session.loggedIn=true
  req.session.user=response
  res.redirect('/')

})




module.exports=router;