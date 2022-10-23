const { response } = require('express');
const express=require('express');
const router=express.Router();
const productHelper=require('../helpers/product-helpers')
const userHelpers=require('../helpers/user-helpers')
const bodyParser=require('body-parser')
const {check,validationResult}=require('express-validator')
const urlencodedParser=bodyParser.urlencoded({extended:false})
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}


//get home page
router.get('/',(req,res,next)=>{
  let user=req.session.user
  console.log(user);
    productHelper.getAllProducts().then((products)=>{
        res.render('user/view-products',{products,user })
    })
   
})

router.get('/login',(req,res)=>{
    if(req.session.isLoggedIn){
       res.redirect('/')
    }else{
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
    res.redirect('/login')

  })
})
router.post('/signup',urlencodedParser,(req,res)=>{
  res.json(req.body)

})
router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true
      req.session.user=response.user
      res.redirect('/')
    }else{
      req.session.loginErr="Invalid username or password"
      res.redirect('/login')
    }
  })
})
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})
router.get('/cart',verifyLogin,(req,res)=>{
  res.render('user/cart')
})

module.exports=router;