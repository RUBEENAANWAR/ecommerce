const { response } = require('express');
const express=require('express');
const router=express.Router();
const productHelper=require('../helpers/product-helpers')
const userHelpers=require('../helpers/user-helpers')
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
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
  if (req.session.loggedIn){
    res.redirect('/')
  }
  else{
    res.render('user/login',{"loginErr":req.session.loginErr})
req.session.loginErr=false
  }
})

router.get('/signup',(req,res)=>{
    res.render('user/signup')
})



router.post('/signup',(req,res)=>{

  userHelpers.doSignup(req.body).then((response)=>{
    console.log(response)
    req.session.loggedIn=true
    req.session.user=response
    res.redirect('/otpLoginVerify')
  })
})
router.post('/login',(req,res)=>{
userHelpers.doLogin(req.body).then((response)=>{
  if(response.status){
    req.session.loggedIN=true
    req.session.user=response.user
    res.redirect('/')
  }else{
    req.session.loginErr="invalid username or password"
    res.redirect("/login")
  }
})
})

router.get("/logout",(req,res)=>{
  req.session.destroy()
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