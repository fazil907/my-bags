const User = require('../../models/userModel');
const Category = require('../../models/categoryModel')
const Product = require('../../models/productModel')
const Address = require('../../models/addressModel')
const Order = require("../../models/orderModel")
const moment = require("moment")

exports.loadProfile = async (req,res)=>{
try {
    const userDetail = req.session.user;
    const userId = userDetail._id;
    const user = await User.findById(userId)
    const addressData = await Address.find({ userId : userId })
    const categoryData = await Category.find({isBlocked : false})

    if(userDetail){
      res.render("profile" , {userDetail , categoryData , addressData})
    }

} catch (error) {
  console.log(error)
}
}

exports.myOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const ordersPerPage = 6;
    const skip = (page - 1) * ordersPerPage;

    const userDetail = req.session.user;

    const userId = userDetail._id;

    const categoryData = await Category.find({ isBlocked: false });

    const orders = await Order.find({ userId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(ordersPerPage);

    const totalCount = await Order.countDocuments({ userId });
    const totalPages = Math.ceil(totalCount / ordersPerPage);

    const formattedOrders = orders.map((order) => {
      const formattedDate = moment(order.date).format("MMMM D, YYYY");
      return { ...order.toObject(), date: formattedDate };
    });

    res.render("viewOrder", {
      title: "View Order",
      categoryData,
      userDetail,
      myOrders: formattedOrders || [],
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.log(error.message);
  }
};


exports.orderDetails = async (req, res) => {
  try {
    const userDetail = req.session.user;
    const userId = userDetail._id;
    const orderId = req.query.orderId;

    const categoryData = await Category.find({ isBlocked: false });

    const orderDetails = await Order.findById(orderId).populate({
      path: "product",
      populate: [{ path: "category", model: "category" }],
    });

    const orderProductData = orderDetails.product;
    const addressId = orderDetails.address;

    const address = await Address.findById(addressId);
    const ExpectedDeliveryDate = moment(
      orderDetails.ExpectedDeliveryDate
    ).format("MMMM D, YYYY");
    const deliveryDate = moment(orderDetails.deliveredDate).format(
      "MMMM D, YYYY"
    );
    const returnEndDate = moment(orderDetails.returnEndDate).format(
      "MMMM D, YYYY"
    );
    const currentDate = new Date();

    res.render("orderDetails", {
      title: "Order Details",
      userDetail,
      categoryData,
      orderDetails,
      orderProductData,
      address,
      currentDate,
      orderProductData,
      ExpectedDeliveryDate,
      deliveryDate,
      returnEndDate,
    });
  } catch (error) {
   res.render("404")
    console.log(error.message);
  }
};


exports.updateOrder = async (req, res) => {
  console.log(113)
  try {
    const userDetail = req.session.user;
    const userId = userDetail._id;

    console.log(117,userId)

    const orderId = req.query.orderId;
    const status = req.body.orderStatus;
    const paymentMethod = req.body.paymentMethod;
    const updatedBalance = req.body.wallet;
    const total = req.body.total;
    const order = await Order.findOne({ _id: orderId });
    const orderIdValue = order.orderId;

    if (paymentMethod !== "Cash On Delivery") {
      await User.findByIdAndUpdate(
        userId,
        { $set: { "wallet.balance": updatedBalance } },
        { new: true }
      );

    
      if (status === "Returned") {
        await Order.findByIdAndUpdate(orderId, {
          $set: { status: status },
          $unset: { ExpectedDeliveryDate: "" },
        });

        const transaction = {
          date: new Date(),
          details: `Returned Order - ${orderIdValue}`,
          amount: total,
          status: "Credit",
        };

        await User.findByIdAndUpdate(
          userId,
          { $push: { "wallet.transactions": transaction } },
          { new: true }
        );

        res.json({
          message: "Returned",
          refund: "Refund",
        });
      }

      if (status === "Cancelled") {
        await Order.findByIdAndUpdate(orderId, {
          $set: { status: status },
          $unset: { ExpectedDeliveryDate: "" },
        });

        const transaction = {
          date: new Date(),
          details: `Cancelled Order - ${orderIdValue}`,
          amount: total,
          status: "Credit",
        };

        await User.findByIdAndUpdate(
          userId,
          { $push: { "wallet.transactions": transaction } },
          { new: true }
        );

        res.json({
          message: "Cancelled",
          refund: "Refund",
        });
      }
    } else if (paymentMethod == "Cash On Delivery" && status === "Returned") {
      await User.findByIdAndUpdate(
        userId,
        { $set: { "wallet.balance": updatedBalance } },
        { new: true }
      );

      const transaction = {
        date: new Date(),
        details: `Returned Order - ${orderIdValue}`,
        amount: total,
        status: "Credit",
      };

      await User.findByIdAndUpdate(
        userId,
        { $push: { "wallet.transactions": transaction } },
        { new: true }
      );

      await Order.findByIdAndUpdate(orderId, {
        $set: { status: status },
        $unset: { ExpectedDeliveryDate: "" },
      });
      res.json({
        message: "Returned",
        refund: "Refund",
      });
    } else if (paymentMethod == "Cash On Delivery" && status === "Cancelled") {
      await Order.findByIdAndUpdate(orderId, {
        $set: { status: status },
        $unset: { ExpectedDeliveryDate: "" },
      });
      res.json({
        message: "Cancelled",
        refund: "No Refund",
      });
    }
  } catch (error) {
   res.render("404")

    console.log(error.message);
  }
};

// exports.filterOrder = async (req, res) => {
//   try {
//     const status = req.query.status;

//     const userDetail = req.session.email;
//     const userId = userDetail._id;

//     const orders = await Order.find({ userId, status: status }).sort({
//       date: -1,
//     });

//     const formattedOrders = orders.map((order) => {
//       const formattedDate = moment(order.date).format("MMMM D YYYY");
//       return { ...order.toObject(), date: formattedDate };
//     });

//     res.json(formattedOrders);
//   } catch (error) {
//     console.log(error.message);
//   }
// };