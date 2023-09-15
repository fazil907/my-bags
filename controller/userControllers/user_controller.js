const User = require("../../models/userModel");
const Category = require("../../models/categoryModel")
const Address = require("../../models/addressModel")
const Product = require("../../models/productModel")
const Razorpay = require("razorpay")


exports.homepage = async (req, res) => {
  try {
    const userDetail = req.session.user;
    const categoryData = await Category.find({ isBlocked: false });
    const productData = await Product.find({ available: true }).populate("category");

    let cartLength = 0; // Initialize cartLength

    if (userDetail) {
      const user = await User.findOne({ _id: userDetail._id }).populate("cart.product").lean();
      const cart = user.cart;
      cartLength = cart.length; // Update cartLength based on the cart length

      res.render("home", { userDetail, categoryData, productData, cartLength });
    } else {
      res.render("home", { categoryData, productData, cartLength });
    }
  } catch (error) {
    res.render("404");
    console.log(error);
  }
};

exports.logout = (req,res)=>{
  try {
    req.session.destroy();
    res.redirect('/')
  } catch (error) {
    console.log(error.message)
  }
}

async function validation(data) {
  const { name, email, address, mobile, city, state, pincode } = data;
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  const pincodeRegex = /^\d{6}$/;
  const cityRegex = /^[a-zA-Z]{2,50}$/;
  const stateRegex = /^[a-zA-Z]{2,50}$/;
  const addressRegex = /^[a-zA-Z0-9\s,.\-]{5,100}$/;

  if (!name) {
    errors.nameError = "please eneter the name";
  }

  if (!email) {
    errors.emailError = "please enter the email";
  } else if (!emailRegex.test(email)) {
    errors.emailRegex = "please provide valid email";
  }

  if (!mobile) {
    errors.phoneError = "Please provide a Phone number";
  } else if (!phoneRegex.test(mobile)) {
    errors.phoneError = "Invalid Phone Number";
  }

  if (!pincode) {
    errors.pincodeError = "Please provide a Pincode";
  } else if (!pincodeRegex.test(pincode)) {
    errors.pincodeError = "Invalid Pin number";
  }

  if (!cityRegex) {
    errors.cityError = "Please provide  your city name";
  } else if (!cityRegex.test(city)) {
    errors.cityError = "Error";
  }

  if (!address) {
    errors.addressError = "Please provide a Address";
  } else if (!addressRegex.test(address)) {
    errors.addressError = "Invalid Address";
  }

  if (!state) {
    errors.stateError = "Please provide your state name";
  } else if (!stateRegex.test(state)) {
    errors.stateError = "Invalid ";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}



exports.addNewAddress = async (req,res)=>{
  try {
    const userDetail = req.session.user;
    const userId = userDetail._id;

    const {name , email , address , mobile , city , state , pincode } = req.body;

    const data = {
      userId,
      name,
      email,
      address,
      mobile,
      city,
      state,
      pincode,
      is_default: false,
    };

    const valid = await validation(req.body);

    if(valid.isValid){
      const address = new Address(data);
      await address.save();
      return res.status(200).end()
    }else if(!valid.isValid){
      return res.status(400).json({error : valid.errors})
    }
  } catch (error) {
   res.render("404")
    console.log(error)
  }
}


exports.newAddress=(req,res)=>{
 
  res.render("addAddress",{title:"Add New Address"})
}



exports.deleteAddress = async (req, res) => {
  try {
    const addressId = req.query.addressId;

    const success = await Address.findByIdAndDelete(addressId);

    if (success) {
      res.status(200).send();
    } else {
      res.status(500).send();
    }
  } catch (error) {
    console.log(error.message);
  }
};




exports.loadEditAddress=async(req,res)=>{
  try {
    const addresId=req.query.addressId
  
    const categoryData = await Category.find({ isBlocked: false });
    const userDetail = req.session.user;
    const userId = userDetail._id;
    const addressData = await Address.findById(addresId);

    const user = await User.findById(userId);


    res.render("editAddress",{title:"Edit Address",
    userDetail,
    addressData,
    categoryData,
  })
  } catch (error) {
    
  }
}



exports.verifyUpdateAddress = async (req, res) => {
  try {
      const { addressId, name, email,address, city, state, pincode, mobile } = req.body;
      // Update the address details in the database using the addressId
      await Address.findByIdAndUpdate(addressId, {
          name,
          email,
          address,
          city,
          state,
          pincode,
          mobile,
      });
   res.redirect("/profile")
    
  } catch (error) {
      // Handle errors
  }
};


exports.addFund = async (req, res) => {
  try {
    console.log(206)
    const amount  = parseFloat(req.body.amount)
    console.log(208, amount)
    // Find the user by ID
    const userDetail = req.session.user
    const userId = userDetail._id
    const user = await User.findById(userId);
    console.log(211 , user)
    // Update the wallet balance
    user.wallet.balance += parseFloat(amount);
    console.log(214 , user.wallet.balance)
    console.log(typeof(amount))
    // Add a transaction record
    user.wallet.transactions.push({
      date: new Date(),
      details: 'Added funds to wallet',
      amount,
      status: 'Success',
    });
    console.log(222)
    // Save the updated user
    await user.save();

    req.session.user.wallet.balance += parseFloat(amount);

    console.log("savedd")
    return res.status(200).json({ message: 'Funds added to wallet successfully' });
  } catch (error) {
    console.error('Error adding funds to wallet:', error);
    return res.status(500).json({ error: 'An error occurred while adding funds to wallet.' });
  }
};

