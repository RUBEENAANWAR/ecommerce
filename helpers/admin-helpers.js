const db = require("../config/connection");
const collection = require("../config/collections");
const bcrypt = require("bcrypt");
const session = require("express-session");
const collections = require("../config/collections");
const ObjectId = require("mongodb").ObjectID;
const {ObjectID}=require('bson')

module.exports = {
  adminSignup: (adminData) => {
    return new Promise(async (resolve, reject) => {
      adminData.Password = await bcrypt.hash(adminData.Password, 10);
      db.get()
        .collection(collection.ADMIN_COLLECTION)
        .insertOne(adminData)
        .then((data) => {
          console.log(data);
          resolve(data.insertedId);
        });
    });
  },

  adminLogin: (adminData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let admin = await db
        .get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne({ Email: adminData.Email });
      if (admin) {
        bcrypt.compare(adminData.Password, admin.Password).then((status) => {
          if (status) {
            console.log("admin login success");
            response.admin = admin;
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
  addCategory: (category, callback) => {
    console.log(category);
    db.get()
      .collection("category")
      .insertOne(category)
      .then((data) => {
        callback(data.insertedId);
      });
  },
  getCategory: () => {
    return new Promise(async (resolve, reject) => {
      let category = await db
        .get()
        .collection(collection.CATEGORY_COLLECTION)
        .find()
        .toArray();
      resolve(category);
    });
  },
  deleteCategory: (categoryId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CATEGORY_COLLECTION)
        .deleteOne({ _id: ObjectId(categoryId) })
        .then((response) => {
          resolve(categoryId);
        });
    });
  },
  allOrders: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let orders = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate([
            {
              $match: { status: { $nin: ["waiting for approval"] } },
            },
          ])
          .sort({ date: -1 })
          .toArray();
        resolve(orders);
      } catch {
        reject();
      }
    });
  },
  orderDetails:(orderId)=>{
    return new Promise(async (resolve,reject)=>{
      let orderDetails=await db.get().collection(collection.ORDER_COLLECTION).find({_id:ObjectID(orderId)}).toArray()
      resolve(orderDetails)
    })
  },
  cancelOrder:(orderId,remark)=>{
    return new Promise((resolve,reject)=>{
      let status='Cancelled'
      db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectID(orderId)},
      {
        $set:{
          status:status,
          remark:remark
        }
      }).then((response)=>{
        resolve()
      }).catch((error)=>{
        reject(error)
      })
    })
  },
  returnOrder:(orderId,remark)=>{
    return new Promise((resolve,reject)=>{
      let status='Waiting for approval'
      db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectID(orderId)},
      {
        $set:{
          status:status,
          remark:remark
        }
      }).then((response)=>{
        resolve()
      }).catch((error)=>{
        reject(error)
      })
    })
  },
  updateOrderStatus:(orderId,status)=>{
    let s1=status
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},
      {
        $set:{
          status:s1,
        }
      }).then((response)=>{
        resolve()
      }).catch((error)=>{
        reject(error)
      })
    })
  }
};
