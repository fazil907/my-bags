const express = require("express");
const user_router = express.Router();
const userController = require('../controller/userControllers/user_controller')
const signUpController = require('../controller/userControllers/signUp_controller')
const otpController = require("../controller/userControllers/otp_controller")
const loginController = require("../controller/userControllers/login_controller")
const productController = require("../controller/userControllers/product_controller")
const cartController = require("../controller/userControllers/cart_controller")
const profileController = require('../controller/userControllers/profile_controller')
const orderController = require('../controller/userControllers/order_controller')
const userAuth = require('../middleware/userAuth')


const {blockCheck,isLogin} = userAuth


// home
user_router.get('/',userController.homepage)
  
// login
user_router.get('/login',loginController.loginPage)
user_router.post('/signup',signUpController.signUpPost)
user_router.post('/login',blockCheck,loginController.loginPost)
user_router.get('/logout',userController.logout)

// forgot otp
user_router.get('/forgotPassword',loginController.forgotPassword)
user_router.post('/verifyEmail',loginController.verifyForgotEmail)
user_router.get('/forgotPasswordOtp',loginController.forgotPasswordOtp)
user_router.post('/verifyForgotPasswordOtp',loginController.verifyForgotPasswordOtp)
user_router.get('/resetPassword', loginController.loadResetPassword)
user_router.post('/resetPassword', loginController.verifyResetPassword)

// Profile
user_router.get('/profile',isLogin,profileController.loadProfile)
user_router.get('/myOrder',isLogin, profileController.myOrders)
user_router.get('/orderDetails',isLogin, profileController.orderDetails)
user_router.post('/updateOrder',isLogin, profileController.updateOrder)
user_router.get("/orderFilter", profileController.filterOrder);
user_router.post("/verifyProfile", profileController.verifyProfile)

// OTP
user_router.get('/otp',otpController.otpGet)
user_router.post('/otpEnter',otpController.otpVerify)

user_router.post('/addFund', userController.addFund);
// user_router.post('/verifyPayment', userController.verifyPayment)
user_router.post('/addNewAddress',isLogin, userController.addNewAddress)
user_router.get('/newAddress', userController.newAddress)
user_router.get("/editAddress",userController.loadEditAddress)
user_router.post("/updateAddress",userController.verifyUpdateAddress)
user_router.get("/deleteAddress", userController.deleteAddress);
  
// Products
user_router.get('/products/:id' , productController.getCategoryProducts)
user_router.get('/products',productController.getProducts)
user_router.get('/productView',productController.getProductView)
user_router.post('/placeOrder',orderController.placeOrder)

user_router.get('/categoryFilter',productController.categoryFilter)

/// cart
user_router.get('/cart',isLogin,cartController.getCart)
user_router.post('/addToCart',isLogin,cartController.addToCart)
user_router.post('/cartUpdation',isLogin, cartController.updateCart)
user_router.get('/removeFromCart',isLogin,cartController.removeFromCart)
user_router.get('/getStock',cartController.getStock)
user_router.get('/checkout',isLogin,cartController.loadCheckout)

user_router.get("/wishlist", isLogin, cartController.loadWishlist);


user_router.get("/orderSuccess",isLogin, orderController.orderSuccess)
user_router.post('/validateCoupon',isLogin,cartController.validateCoupon)


module.exports = user_router;