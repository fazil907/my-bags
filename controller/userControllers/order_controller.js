const User = require('../../models/userModel');
const Category = require('../../models/categoryModel');
const Product = require('../../models/productModel');
const Address = require('../../models/addressModel');
const Order = require('../../models/orderModel')
const Coupon = require('../../models/couponModel')
const Razorpay = require("razorpay")


exports.placeOrder = async (req, res) => {
  console.log(115)
  try {
    const userDetail = req.session.user;
    const userId = userDetail._id;
    const addressId = req.body.selectedAddress;
    const amount = req.body.amount;
    const paymentMethod = req.body.selectedPayment;
    const couponData = req.body.couponData;

    console.log(124,userDetail)
    console.log(userId)
    console.log(addressId)
    console.log(amount)
    console.log(paymentMethod)
    console.log(couponData)


    const user = await User.findOne({ _id: userId }).populate("cart.product");
    console.log(25, user)
    const userCart = user.cart;

    let subTotal = 0;
    let size;
    userCart.forEach((item) => {
      item.total = item.product.price * item.quantity;
      subTotal += item.total;
      size = item.size;
    });

    let productData = userCart.map((item) => {
      return {
        id: item.product._id,
        name: item.product.name,
        category: item.product.category,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.imageUrl[0].url,
      };
    });
    
    console.log(148,productData)

    const result = Math.random().toString(36).substring(2, 7);
    const id = Math.floor(100000 + Math.random() * 900000);
    const orderId = result + id;

    let saveOrder = async () => {
      const ExpectedDeliveryDate = new Date();
      ExpectedDeliveryDate.setDate(ExpectedDeliveryDate.getDate() + 3);

      if (couponData) {
        const order = new Order({
          userId: userId,
          product: productData,
          address: addressId,
          orderId: orderId,
          total: subTotal,
          ExpectedDeliveryDate: ExpectedDeliveryDate,
          paymentMethod: paymentMethod,
          discountAmount: couponData.discountAmount,
          amountAfterDiscount: couponData.newTotal,
          couponName: couponData.couponName,
          isNotBlocked: true,
        });
        console.log(172)
        await order.save();
        const couponCode = couponData.couponName;
        await Coupon.updateOne(
          { code: couponCode },
          { $push: { usedBy: userId } }
        );
      } else {
        const order = new Order({
          userId: userId,
          product: productData,
          orderId: orderId,
          address: addressId,
          ExpectedDeliveryDate: ExpectedDeliveryDate,
          total: subTotal,
          paymentMethod: paymentMethod,
        });
        await order.save();
      }

      let userDetails = await User.findById(userId);

      let userCartDetails = userDetails.cart;

      console.log(196, userCartDetails)

      userCartDetails.forEach(async (item) => {
        const productId = item.product._id;

        const quantity = item.quantity;

        const product = await Product.findById(productId);

        let stock = product.stock;

        stock -= quantity

        await product.save();
      });

      userDetails.cart = [];
      await userDetails.save();
    };

    if (addressId) {
      if (paymentMethod === "Cash On Delivery") {
        saveOrder();
        req.session.checkout = false;

        res.json({
          order: "Success",
        });
      } else if (paymentMethod === "Razorpay") {
        var instance = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const order = await instance.orders.create({
          amount: amount * 100,
          currency: "INR",
          receipt: "MY BAGS",
        });

        saveOrder();
        req.session.checkout = false;

        res.json({
          order: "Success",
        });
      } else if (paymentMethod === "Wallet") {
        try {
          const walletBalance = req.body.walletBalance;

          await User.findByIdAndUpdate(
            userId,
            { $set: { "wallet.balance": walletBalance } },
            { new: true }
          );

          const transaction = {
            date: new Date(),
            details: `Confirmed Order - ${orderId}`,
            amount: subTotal,
            status: "Debit",
          };

          // await User.findByIdAndUpdate(
          //   userId,
          //   { $push: { "wallet.transactions": transaction } },
          //   { new: true }
          // );

          saveOrder();
          req.session.checkout = false;

          console.log(268)
          res.json({
            order: "Success",
          });
        } catch (error) {
          console.log(error.message);
        }
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};




exports.orderSuccess = async (req, res) => {
  try {
    const categoryData = await Category.find({ isBlocked: false });
    const userDetail = req.session.user;

    res.render("orderSuccess", {
      categoryData,
      userDetail,
    });
  } catch (error) {
   res.render("404")
    console.log(error)
  }
};