const express=require('express')
// const{render}=require('../app')
// const productHelpers = require('../helpers/product-helpers')
const router=express.Router()
const productHelper=require('../helpers/product-helpers')

router.get('/',(req,res,next)=>{
    productHelper.getAllProducts().then((products)=>{
        console.log(products);
        res.render('./admin/view-products',{admin:true,products})
    })
   
})

router.get("/add-product",(req,res)=>{
    res.render('admin/add-product')
})
router.post('/add-product',(req,res)=>{
    console.log(req.body)
    console.log(req.files.Image)
    productHelper.addProduct(req.body,(id)=>{
        let image=req.files.Image
        image.mv('./public/product-images/'+id+'.jpg',(err)=>{
            if(!err){
                res.render('admin/add-product')
            }else{
                console.log(err)
            }
        })
        
    })
})
module.exports=router