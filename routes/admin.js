const express=require('express')
// const{render}=require('../app')
// const productHelpers = require('../helpers/product-helpers')
const router=express.Router()
const productHelpers=require('../helpers/product-helpers')
const bodyParser=require('body-parser')
const adminHelpers=require('../helpers/admin-helpers')
const {check,validationResult}=require('express-validator')
const urlencodedParser=bodyParser.urlencoded({extended:false})
// const verifyAdminLogin=(req,res,next)=>{
//     if(req.session.loggedIn){
//       next()
//     }
//     else{
//       res.redirect('/adminLogin')
//     }
  
//   }


router.get('/',(req,res,next)=>{
    let adminData=req.session.admin;
    if(!adminData){
        res.render('admin/adminLogin',{admin:true})
    }
    productHelpers.getAllProducts().then((products)=>{
        console.log(products)
        res.render('admin/view-products',{admin:true,products,adminData})

    })
})

router.get("/add-product",(req,res)=>{
    res.render('admin/add-product')
})
router.post('/add-product',(req,res)=>{
    productHelpers.addProduct(req.body,(id)=>{
        let image=req.files.Image
        console.log(id)
        image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
            if(!err){
                res.redirect('/admin')
            }
            else{
                console.log(err)
            }
        })
    })
})

router.get("/delete-product/:id",(req,res)=>{
let proId=req.params.id
productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin')
})
})

router.get('/edit-product/:id',async(req,res)=>{
    let product= await productHelpers.getProductDetails(req.params.id)
    console.log(product)
    res.render('admin/edit-product',{product})
})

router.post('/edit-product/:id',(req,res)=>{
    console.log(req.params.id);
    let id=req.params.id
    productHelpers.updateProduct(req.params.id,req.body).then(()=>{
        res.redirect('/admin')
        if(req.files.Image){
            let image=req.files.Image
            image.mv('./public/product-images/'+id+'.jpg')
        }
    })    
})

router.get('/category-management',(req,res)=>{
    res.render('admin/add-category')
})

router.get("/adminLogin", (req, res) => {
    if (req.session.loggedIn) {
      res.redirect("/admin");
    } else {
      res.render('adminLogin', { admin: true, loginErr: req.session.loginErr });
      req.session.loginErr = false;
    }
  });
  
  router.get("/adminSignup", (req, res) => {
    res.render("admin/adminSignup", { admin: true });
  });
  
  router.post("/adminSignup", (req, res) => {
    adminHelpers.adminSignup(req.body).then((response) => {
      console.log(response);
      res.redirect("/admin/adminLogin");
    });
  });

router.post('/adminLogin',(req,res)=>{
    adminHelpers.adminLogin(req.body).then((response)=>{
      if(response.status){
        req.session.loggedIN=true
        req.session.admin=response.admin
        res.redirect('/admin')
      }else{
        req.session.loginErr="invalid username or password"
        res.redirect("/adminLogin")
      }
    })
    })
    
    router.get("/logout",(req,res)=>{
        req.session.destroy()
        res.redirect("/admin")
      })


module.exports=router;