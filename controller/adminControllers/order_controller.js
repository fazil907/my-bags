const User = require("../../models/userModel");
const Product = require("../../models/productModel");
const Category = require("../../models/categoryModel");
const Address = require("../../models/addressModel")
const Order = require("../../models/orderModel")
const moment = require("moment")


exports.getorder = async (req,res)=>{
try {
    const ordersPerPage = 7
    const page = parseInt(req.query.page) || 1;
    const skip = (page-1) * ordersPerPage;

    const orders = await Order.find().sort({ date : -1}).skip(skip).limit(ordersPerPage);

    const totalCount = await Order.countDocuments()
    const totalPages = Math.ceil((totalCount/ordersPerPage));

    const orderData = orders.map((order)=>{
      const formttedDate = moment(order.date).format("MMMM D YYYY")

      return {
        ...order.toObject(),
        date : formttedDate
      }
    })

    res.render("orders" , {
     orderData , 
     user : req.session.admin,
     orderData,
     currentPage : page,
     totalPages 
    })
} catch (error) {
  console.log(error)
}
}

exports.updateOrder = async (req,res)=>{
  try {
    const orderId = req.query.orderId
    const status =  req.body.status
    console.log(44,orderId)
    console.log(45,status)
    if(status === "Delivered"){
      const returnDate = new Date()
      returnDate.setDate(returnDate.getDate() + 7)

      await Order.findByIdAndUpdate(
        orderId,
        {
          $set : {
            status : status,
            deliveredDate : new Date(),
            returnEndDate : returnDate
          },
          $unset : {
              ExpectedDeliveryDate : ""
          },
        },
        {new : true}
      )
    }else if(status === "Cancelled"){
      await Order.findByIdAndUpdate(
        orderId,
        {
          $set : {
            status : status
          },

          $unset : {
            ExpectedDeliveryDate : ""
          }
        },
        { new : true}
      )
    }else if(status === "Shipped"){
      await Order.findByIdAndUpdate(
        orderId,
        {
          $set : {
            status : status
          }
        },
        {
          new : true
        }
      )
    }
  } catch (error) {
    console.log(error)
  }
}


exports.getOrderDetails = async (req,res)=>{
try {
  const orderId = req.query.orderId;
  const orderDetails = await Order.findById(orderId)
  const orderProductData = orderDetails.product
  const addressId = orderDetails.address
  const addressData =await Address.findById(addressId)
  res.render("adminOrderDetails" , {orderDetails ,addressData , orderProductData })
  
} catch (error) {
  console.log(error)
}}



