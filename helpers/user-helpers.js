const db = require("../config/connection");
const collection = require("../config/collections");
const bcrypt = require("bcrypt");
const {
  UserBindingContext,
} = require("twilio/lib/rest/chat/v2/service/user/userBinding");
const session = require("express-session");
const { adminCategoryManagement } = require("./admin-helpers");
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
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });
      if (userCart) {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { user: ObjectId(userId) },
            {
              $push: { products: ObjectId(proId) },
            }
          )
          .then((response) => {
            resolve();
          });
      } else {
        let cartObj = {
          user: ObjectId(userId),
          products: [ObjectId(proId)],
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
            $match: { user: ObjectId(userId) },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              let: { prodList: "$products" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ["$_id", "$$prodList"],
                    },
                  },
                },
              ],
              as: "cartItems",
            },
          },
        ])
        .toArray();
      resolve(cartItems[0].cartItems);
    });
  },
  

  }
  // addNewCategoryGet:(req,res)=>{
  //   adminSession=req.session
  //   if(adminSession.adminId){
  //       if(adminsession.categoryExist){
  //         adminSession=req.session
  //         adminSession.categoryExist=false
  //         res.render('admin/addNewCategory',{categoryMsg:'category already exist',admin:true})
  //       }else{
  //         res.render('admin/addNewCategory',{admin:true})
  //       }
  //     }else{
  //       res.redirect('/admin')
  //     }
  //   },
  //   addNewCategoryPost:(req,res)=>{
  //     const errors=validationResult(req)
  //     console.log(errors)
  //     const error1=errors.errors.find(item=>item.param==='category') || '';
  //     console.log(error1.msg)
  //     adminSession=req.session
  //     if(!errors.isEmpty()){
  //       res.render('admin/addNewCategory',{categoryMsg:error1.msg,admin:true})
  //     }else if(adminSession.adminId){
  //       Category.find({categoryName:req.body.category.toUppercase()}
  //       .then((result)=>{
  //         let temp=result.find(item=>item.categoryName)
  //         if(temp){
  //           adminSession=req.session
  //           adminSession.categoryExist=true
  //           res.redirect('/admin/addNewCategory')
  //         }else{
  //           const category=new Category({
  //             categoryName: req.body.category.toUppercase()
  //           })
  //           category.save()
  //           .then((result)=>{
  //             console.log(result)
  //           })
  //           .catch((err)=>{
  //             console.log(err)
  //           })
  //           adminSession=req.session
  //           console.log(adminSession)
  //           res.redirect('/admin/adminCategoryManagement')
  //         }
  //       })
  //       .catch((err)=>{
  //         console.log(err)
  //       })
  //     } else{
  //       res.redirect('/admin')
  //     }

  //   }

