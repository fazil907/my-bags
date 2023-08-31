const User = require('../../models/userModel')
const Category = require('../../models/categoryModel')
const Product = require('../../models/productModel')
const Order = require('../../models/orderModel')
const Coupon = require('../../models/couponModel')
const moment = require("moment")

exports.loadCoupons = async (req,res)=>{
  try {
    const coupon = await Coupon.find()
    const couponData = coupon.map((element)=>{
      const formattedDate = moment(element.expiryDate).format("MMMM D, YYYY")

      return {
        ...element,
        expiryDate : formattedDate
      }
    })

    res.render("coupons" , {couponData})
  } catch (error) {
    console.log(error)
  }
}

exports.loadAddCoupon = async (req, res) => {
  try {
    res.render("addCoupon", );
  } catch (error) {
    console.log(error.messaage);
  }
};

exports.addCoupon = async (req,res)=>{
  console.log(88)
  try {
    const {couponCode, couponDiscount , minDiscount , maxDiscount , couponDate} = req.body
    const couponCodeUpperCase = couponCode.toUpperCase()
    const couponExist = await Coupon.findOne({ code: couponCodeUpperCase });


    console.log(req.body)

    if(!couponExist){
      const coupon = new Coupon({
        code : couponCodeUpperCase,
        discount : couponDiscount,
        minDiscount : minDiscount,
        maxDiscount : maxDiscount,
        expiryDate : couponDate
      })

      await coupon.save()
      res.json({message : "coupon added"})
    }else{
      res.json({message : "coupon exists"})
    }
  } catch (error) {
    console.log(error)
  }
} 

exports.blockCoupon = async (req, res) => {
  try {
    const couponId = req.query.couponId;
    const unlistCoupon = await Coupon.findById(couponId);
    await Coupon.findByIdAndUpdate(
      couponId,
      { $set: { status: !unlistCoupon.status } },
      { new: true }
    );

    res.json({ message: "success" });
  } catch (error) {
    console.log(error.message);
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const couponId = req.query.couponId;
    await Coupon.findByIdAndDelete(couponId);

    res.json({ message: "success" });
  } catch (error) {
    console.log(error.message);
  }
};