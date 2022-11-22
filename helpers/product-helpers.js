const db = require("../config/connection");
const collection = require("../config/collections");
// const collections = require("../config/collections");

const ObjectId = require("mongodb").ObjectID;

module.exports = {
  addProduct: (product, callback) => {
    // console.log(product)

    product.stock = parseInt(product.stock);
    product.Price = parseInt(product.Price);

    db.get()
      .collection("product")
      .insertOne(product)
      .then((data) => {
        callback(data.insertedId);
      });
  },
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db.get().collection("product").find().toArray();
      resolve(products);
    });
  },
  deleteProduct: (proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("product")
        .deleteOne({ _id: ObjectId(proId) })
        .then((response) => {
          resolve(proId);
        });
    });
  },
  getProductDetails: (proId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection("product")
        .findOne({ _id: ObjectId(proId) })
        .then((product) => {
          resolve(product);
        });
    });
  },
  updateProduct: (proId, proDetails) => {
    return new Promise((resolve, reject) => {
      proDetails.stock = parseInt(proDetails.stock);
      proDetails.Price = prseInt(proDetails.Price);

      db.get()
        .collection("product")
        .updateOne(
          { _id: ObjectId(proId) },
          {
            $set: {
              index: proDetails.No,
              Name: proDetails.Name,
              Description: proDetails.Description,
              Price: proDetails.Price,
              stock: proDetails.stock,
              Category: proDetails.Category,
            },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  singleProductView: (proId) => {
    console.log(proId);
    return new Promise(async (resolve, reject) => {
      const product = await db
        .get()
        .collection("product")
        .findOne({ _id: ObjectId(proId) });
      resolve(product);
    });
  },
  addBanner: (banner, callback) => {
    db.get()
      .collection("banner")
      .insertOne(banner)
      .then((data) => {
        callback(data.insertedId);
      });
  },
  getAllBanner: () => {
    return new Promise(async (resolve, reject) => {
      let banners = await db
        .get()
        .collection(collection.BANNER_COLLECTION)
        .find()
        .toArray();
      resolve(banners);
    });
  },
  deleteBanner: (bannerId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.BANNER_COLLECTION)
        .deleteOne({ _id: ObjectId(bannerId) })
        .then((response) => {
          resolve(bannerId);
        });
    });
  },
};
