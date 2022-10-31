const db = require("../config/connection");
const collection = require("../config/collections");
const bcrypt = require("bcrypt");
const {
  UserBindingContext,
} = require("twilio/lib/rest/chat/v2/service/user/userBinding");
const session = require("express-session");
const { adminCategoryManagement } = require("./admin-helpers");
const collections = require("../config/collections");
const dotenv = require("dotenv").config();
const client = require("twilio")(process.env.accountSid, process.env.authToken);
const ObjectId = require("mongodb").ObjectId;

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.userBlock = false;
      userData.Password = await bcrypt.hash(userData.Password, 10);
      client.verify
        .services(process.env.serviceID)
        .verifications.create({
          to: `+91${userData.Mobilenumber}`,
          channel: "sms",
        })
        .then((data) => {
          (Name1 = userData.Name),
            (Mobilenumber1 = userData.Mobilenumber),
            (Password1 = hashPassword),
            (Email1 = userData.Email);
          res.redirect("/otpSignupVerify");
        });
      db.get()
        .collection(collection.USER_COLLECTION)
        .insertOne(userData)
        .then((data) => {
          //console.log(data)
          resolve(data.insertedId);
          console.log(data);
        });
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ Email: userData.Email });
      if (user && !user.userBlocked) {
        bcrypt.compare(userData.Password, user.Password).then((status) => {
          if (status) {
            console.log("login success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("login failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("login failed");
        resolve({ status: false });
      }
    });
  },
  otpSignupVerifyGet: (req, res) => {
    //session = req.session;
    if (session.userId) {
        res.redirect('/');
    } else if (session.invalidOTP) {
        session.invalidOTP = false
        res.render('user/otpLoginVerify', { otpMsg: "Wrong phone number or code" });
    } else {
        res.render('user/otpSignupVerify');
    }
},


  otpSignupVerifyPost: (req, res) => {
    if (req.body.otp.length === 6) {
      client.verify
        .services(process.env.serviceID)
        .verificationChecks.create({
          to: `+91${Mobilenumber1}`,
          code: req.body.otp,
        })
        .then((data) => {
          if (data.status === "approved") {
            const user = new User({
              Name: Name1,
              Mobilenumber: Mobilenumber1,
              Email: Email1,
              Password: Password1,
            });
            user
              .save()
              .then((result) => {
                console.log("otp signup successful");
              })
              .catch((err) => {
                console.log(err);
              });
            res.redirect("/");
          } else {
            session = req.session;
            session.invalidOTP = true;
            res.redirect("/otpLoginVerify");
          }
        });
    } else {
      session = req.session;
      session.invalidOTP = true;
      res.redirect("/otpLoginVerify");
    }
  },
  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray();
      resolve(users);
    });
  },

  blockUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userId) },
          {
            $set: {
              userBlocked: true,
            },
          }
        )
        .then((response) => {
          console.log(userId);
          resolve(response);
        });
    });
  },
  unblockUser: (user) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(user) },
          {
            $set: {
              userBlocked: false,
            },
          }
        )
        .then((response) => {});
    });
  },
  addToCart: (proId, userId) => {
    let proObj={
      item:ObjectId(proId),
      quantity:1
    }
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });
      if (userCart) {
        let proExist=userCart.products.findIndex(product=>product.item==proId)
         console.log(proExist)
         if (proExist!=-1){
            db.get().collection(collections.CART_COLLECTION)
            .updateOne({user:ObjectId(userId),'products.item':ObjectId(proId)},
               {
                $inc: {'products.$.quantity':1}
               }   
             
            ).then(()=>{
              resolve()
            })
         }else{
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { user: ObjectId(userId) },
            {
              $push: { products: proObj },
            }
          )
          .then((response) => {
            resolve();
          });
        }
      } else {
        let cartObj = {
          user: ObjectId(userId),
          products: [proObj],
        };
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(cartObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) }
          },
          {
            $unwind:'$products'
          },
          {
            $project:{
              item:'$products.item',
              quantity:'$products.quantity'
            }
          },
          {
            $lookup:{
              from:collection.PRODUCT_COLLECTION,
              localField:'item',
              foreignField:'_id',
              as:'product'
            }
          },
          {
            $project:{
              item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
            }
          }
        ]).toArray();
        // console.log(cartItems)
      resolve(cartItems);
    });
  },
  getCartCount:(userId)=>{
    return new Promise(async(resolve,reject)=>{
      let count=0
      let cart=await db.get().collection(collections.CART_COLLECTION).findOne({user:ObjectId(userId)})
      if(cart){
        count=cart.products.length
      }
      resolve(count)
    })
  },
  changeProductQuantity:(details)=>{
    details.count=parseInt(details.count)
    details.quantity=parseInt(details.quantity)
    return new Promise((resolve,reject)=>{
      if(details.count==-1 && details.quantity==1){
      db.get().collection(collections.CART_COLLECTION)
      .updateOne({_id:ObjectId(details.cart)},
      {
       $pull: {products:{item:ObjectId(details.product)}}
      }   
    
   ).then((response)=>{
     resolve({removeProduct:true})
   })
    }else{
      db.get().collection(collections.CART_COLLECTION)
      .updateOne({_id:ObjectId(details.cart),'products.item':ObjectId(details.product)},
      {
        $inc:{'products.$.quantity':details.count}
      }
    ).then((response)=>{
      resolve(true)
    })
   }
  })
},
removeCart:(cartId,proId)=>{
  
}

}


    
  
  

  


