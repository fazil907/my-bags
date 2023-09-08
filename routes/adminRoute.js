const express = require("express");
const admin_router = express.Router();
const session = require("express-session");
const auth = require('../middleware/adminAuth')
const store = require('../middleware/multer')
const adminController = require("../controller/adminControllers/admin_controller");
const dashboardController = require("../controller/adminControllers/dashboard_controller");
const usersController = require('../controller/adminControllers/users_controller')
const categoryController = require('../controller/adminControllers/category_controller')
const productController = require('../controller/adminControllers/product_controller')
const orderController = require('../controller/adminControllers/order_controller')
const couponController = require('../controller/adminControllers/coupon_controller')
const {isLogged} = auth

admin_router.get("/", adminController.adminLogin);
admin_router.post("/login", adminController.loginPost);
admin_router.get("/logout", adminController.adminLogout);

admin_router.get('/dashboard',isLogged,dashboardController.dashboardGet)
admin_router.get("/chartData", dashboardController.chartData);
admin_router.get("/generateSalesReport", isLogged,dashboardController.generateSalesReport);
admin_router.post('/downloadSalesReport', dashboardController.downloadSalesReport)


//users // block and unblock
admin_router.get('/users',isLogged,usersController.getUsers)
admin_router.get('/block/:id',usersController.userBlock);
admin_router.get('/unBlock/:id',usersController.userUnblock);


// category

admin_router.get('/category',isLogged,categoryController.loadCategory)
admin_router.get('/addCategory',isLogged,categoryController.addCategory)
admin_router.post('/addCategory',store.single("image"),categoryController.addNewCategory)
admin_router.get('/editCategory/:id',isLogged,categoryController.editCategory)
admin_router.post('/updateCategory/:id',store.single("image"),categoryController.updateCategory)
admin_router.get('/unListCategory/:id',isLogged,categoryController.unListCategory)


/// products

admin_router.get('/products',isLogged,productController.getProduct)
admin_router.get('/addProducts',isLogged,productController.getAddProduct)
admin_router.post('/addProducts',isLogged,store.array("image",4),productController.addNewProduct)
admin_router.get('/editProducts/:id',isLogged,productController.getEditProduct)
admin_router.post('/updateProducts/:id',store.single("image"),productController.updateProduct)
admin_router.get("/deleteProduct/:id", isLogged, productController.deleteProduct);

// order

admin_router.get('/orders' ,isLogged, orderController.getorder)
admin_router.post('/updateOrder',isLogged,orderController.updateOrder)
admin_router.get('/orderDetails',isLogged,orderController.getOrderDetails)

// coupons

admin_router.get('/coupons',isLogged,couponController.loadCoupons )
admin_router.get('/loadAddCoupon',isLogged, couponController.loadAddCoupon)
admin_router.post('/addCoupon', couponController.addCoupon)
admin_router.post("/blockCoupon",couponController.blockCoupon);
admin_router.post("/deleteCoupon",couponController.deleteCoupon);

module.exports = admin_router;
