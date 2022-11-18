const express = require("express");
// const{render}=require('../app')
const router = express.Router();
const productHelpers = require("../helpers/product-helpers");
const bodyParser = require("body-parser");
const adminHelpers = require("../helpers/admin-helpers");
const userHelpers = require("../helpers/user-helpers");
const { check, validationResult } = require("express-validator");
const { Db } = require("mongodb");
const collections = require("../config/collections");
const db = require("../config/connection");
const fs = require("fs");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const adminControllers = require("../controllers/adminControllers");
const excelJs = require("exceljs");
const verifyAdminLogin = (req, res, next) => {
  if (req.session && req.session.admin && req.session.admin.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

router.get("/dashboard",verifyAdminLogin, async (req, res) => {
  try {
    let adminData = req.session.admin;
    let allCount = {};
    allCount.userCount = await adminHelpers.userCount();
    allCount.productCount = await adminHelpers.productCount();
    allCount.orderCount = await adminHelpers.orderCount();
    allCount.totalSales = await adminHelpers.totalSales();
    salesReport = await adminHelpers.weeklySales();
    productReport = await adminHelpers.getProductReport();
    res.render("admin/adminHome", {
      admin: true,
      adminData,
      allCount,
      salesReport,
      productReport,
    });
  } catch {
    let adminData = req.session.admin;
    let allCount = {};
    allCount.userCount = 0;
    allCount.productCount = 0;
    allCount.orderCount = 0;
    allCount.totalSales = 0;
    salesReport = 0;

    res.render("admin/adminHome", {
      admin: true,
      adminData,
      allCount,
      salesReport,
    });
  }
});
router.get("/", adminControllers.adminHomePage);

router.get("/add-product",verifyAdminLogin, adminControllers.addProductGet);
router.post("/add-product",verifyAdminLogin, adminControllers.addProductPost);

router.get("/delete-product/:id", verifyAdminLogin,adminControllers.deleteProductGet);

router.get("/edit-product/:id",verifyAdminLogin, adminControllers.editProductGet);

router.post("/edit-product/:id", verifyAdminLogin,adminControllers.editProductPost);

router.get("/admin-signup", adminControllers.adminSignupGet);

router.post("/admin-signup", adminControllers.adminSignupPost);

router.get("/login", adminControllers.adminLoginGet);

router.post("/login", adminControllers.adminLoginPost);

router.get("/view-users", verifyAdminLogin,adminControllers.adminViewUsers);

router.get("/block-user/:id", verifyAdminLogin,adminControllers.adminBlockUser);

router.get("/unblock-user/:id",verifyAdminLogin, adminControllers.adminUnblockUser);

router.get("/logout",verifyAdminLogin,adminControllers.adminLogout);

router.get("/category-management",verifyAdminLogin, adminControllers.categoryManagement);
router.get("/addNewCategory", adminControllers.addNewcategoryGet);

router.post("/addNewCategory", verifyAdminLogin,adminControllers.addNewCategoryPost);

router.get("/delete-category/:id",verifyAdminLogin, adminControllers.deleteCategory);

router.get("/order-management", verifyAdminLogin,adminControllers.adminOrderManagement);

// router.get('/viewOrderUp/:orderId',verifyAdminLogin,adminControllers.adminOrderUp)

// router.get('/cancelOrder/:orderId',adminControllers.cancelOrder)
router.get(
  "/viewOrderUp/:orderId",
  verifyAdminLogin,
  adminControllers.adminOrderUp
);

router.post("/cancelOrder/:orderId",verifyAdminLogin, adminControllers.cancelOrder);

router.post("/orderStatusUpdate/:orderId",verifyAdminLogin, (req, res) => {
  let orderId = req.params.orderId;
  let status = req.body.status;

  adminHelpers
    .updateOrderStatus(orderId, status)
    .then((response) => {
      res.redirect("../viewOrderUp/" + orderId);
    })
    .catch((error) => {
      res.redirect("./error");
    });
});

router.get("/salesReport",verifyAdminLogin,async(req, res) => {
  adminData=req.session.admin
  adminHelpers.allOrders().then((orders)=>{
    res.render("admin/salesReport",{admin:true,adminData,orders});
  }).catch(()=>{
    res.redirect('./error')
  })
});

router.get('/exportExcel',async(req,res)=>{
  let salesReport=await adminHelpers.getTotalSalesReport()
  try{
    const workbook=new excelJs.Workbook()
    const worksheet=workbook.addWorksheet('Sales Report')
    worksheet.columns = [
      { header: "S no.", key: "s_no" },
      { header: "OrderID", key: "_id" },
      { header: "User", key: "name" },
      { header: "Date", key: "date" },
      //{ header: "Products", key: "products" },
      { header: "Method", key: "paymentMethod" },
      { header: "status", key: "status" },
      { header: "Amount", key: "totalAmount" },
  ];
  let counter = 1;
        salesReport.forEach((report) => {
            report.s_no = counter;
            report.products = "";
            report.name = report.deliveryDetails.name;
            report.product.forEach((eachProduct) => {
                report.product += eachProduct.product.Name + ",";
            });
            worksheet.addRow(report);
            counter++;
        });

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
        });


        res.header(
            "Content-Type",
            "application/vnd.oppenxmlformats-officedocument.spreadsheatml.sheet"
        );
        res.header("Content-Disposition", "attachment; filename=report.xlsx");

        workbook.xlsx.write(res)
  }catch(err){
    console.log(err);
    res.redirect('./error')
  }
})

router.get('/coupon',verifyAdminLogin,(req,res)=>{
  adminData=req.session.admin
  adminHelpers.allCoupon().then((coupon)=>{
    res.render("admin/coupon",{admin:true,adminData,coupon})
  })
})

router.post('/coupon',verifyAdminLogin,(req,res)=>{
  adminData=req.session.admin
  req.body.value=parseInt(req.body.value)
  adminHelpers.addCoupon(req.body).then(()=>{
    res.redirect("./coupon")
  }).catch((data)=>{
    adminHelpers.allCoupon().then((coupon)=>{
      let message=data.message
      res.render('admin/coupon',{admin:true,adminData,coupon,message})
    })
  })
})

router.get('/couponDelete/:couponId',verifyAdminLogin,(req,res)=>{
  adminData=req.session.admin
  let couponId=req.params.couponId
  adminHelpers.couponDelete(couponId).then((response)=>{
    res.redirect('/admin/coupon',{admin:true,adminData})
  })
})

module.exports = router;
