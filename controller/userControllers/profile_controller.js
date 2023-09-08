const User = require('../../models/userModel');
const Category = require('../../models/categoryModel')
const Product = require('../../models/productModel')
const Address = require('../../models/addressModel')
const Order = require("../../models/orderModel")
const moment = require("moment")
const bcrypt = require('bcrypt')

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

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

exports.verifyProfile = async (req, res) => {
  console.log(10)
  try {
    const data = {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
    };

    console.log(243, data);

    const user = await User.findOne({ email: data.email });
    
    console.log(247,user)

    const valid = await profileValidation(req.body);

    console.log(249)
    if (!valid.isValid) {
      return res.status(400).json({ error: valid.errors });
    }
    
    if (data.newPassword) {
      const hashedPassword = await securePassword(data.newPassword);
      console.log(257,hashedPassword);
      user.password = hashedPassword;
    }

    await user.save();
    console.log("savedd")
    return res.status(200).end();
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.filterOrder = async (req, res) => {
  try {
    const status = req.query.status;

    const userDetail = req.session.user;
    const userId = userDetail._id;

    const orders = await Order.find({ userId, status: status }).sort({
      date: -1,
    });

    const formattedOrders = orders.map((order) => {
      const formattedDate = moment(order.date).format("MMMM D YYYY");
      return { ...order.toObject(), date: formattedDate };
    });

    res.json(formattedOrders);
  } catch (error) {
    console.log(error.message);
  }
};

async function profileValidation(data) {
  console.log(290)
  const { name, phone, email, currentPassword, newPassword, confirmPassword } = data;
  console.log(data)
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  const existingUser = await User.findOne({ email: email });

  console.log(298,existingUser)

  if (!email) {
    errors.emailError = "Please Enter an Email";
  } else if (!emailRegex.test(email)) {
    errors.emailError = "Please provide a valid Email";
  }

  if (!name) {
    errors.nameError = "Please Enter a Name";
  }

  if (!phone) {
    errors.phoneError = "Please provide a Phone number";
  } else if (!phoneRegex.test(phone)) {
    errors.phoneError = "Invalid Phone Number";
  }

  if (  
    currentPassword &&
    !(await bcrypt.compare(currentPassword, existingUser.password))
  ) {
    errors.currentPasswordError = "Incorrect Password!";
  }

  if (!email) {
    errors.emailError = "Please Enter an Email";
  } else if (!emailRegex.test(email)) {
    errors.emailError = "Please provide a valid Email";
  }

  if (!newPassword) {
    errors.newPasswordError = "Please provide a Password";
  } else if (!passwordRegex.test(newPassword)) {
    errors.newPasswordError =
      "Password must be 8 characters with one uppercase letter, one lowercase letter, and one number";
  }

  if (newPassword !== confirmPassword && newPassword.length > 0) {
    errors.confirmPasswordError = "The passwords do not match";
  }

  console.log(87398)

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}