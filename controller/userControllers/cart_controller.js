const User = require('../../models/userModel');
const Product = require("../../models/productModel");
const Category = require('../../models/categoryModel')
const Address = require('../../models/addressModel');
const Coupon = require("../../models/couponModel")

exports.getCart = async (req,res)=>{
try {
    const userDetail = req.session.user;
    // console.log(9, userDetail)
    const userId = userDetail._id
    // console.log(10,userDetail)
    const categoryData = await Category.find({isBlocked : false});    
    // const productData = await Product.find({isBlocked:false})
  
    const  user = await User.findOne({_id : userId}).populate("cart.product").lean()
    const cart = user.cart
    const cartLength = user.cart.length;
  
    let subTotal = 0;
  
    cart.forEach((val)=>{
      val.total = val.product.price * val.quantity
      subTotal += val.total
    })
    
    if(cart.length === 0){
      res.render("cart" , {
        userDetail,
        categoryData,
        cart : [],
        cartLength,
        subtotal : 0,
        isEmpty : true
      })
    }else{
      res.render("cart",{
        userDetail,
        categoryData,
        cartLength,
        cart,
        subTotal,
        isEmpty : false
      })
    }
  
} catch (error) {
  res.render("404")
  console.log(error)
}
}


// exports.addToCart = async (req,res)=>{
//   try {
//     const userDetail = req.session.user;
//     const userId = userDetail._id;
//     const { quantity} = req.body
//     const productId = req.body.productId.trim();
    
//     const product = await Product.findById(productId)
//     const stock = product.stock
//     const existed = await User.findOne({
//       _id : userId,
//       "cart.product" : productId
//     })
//     let status = false;
//     if(quantity > stock){
//       status = true
//     }
//     if(status){
//       return res.status(400).json({message : "Out of Stock"})
//     }
//     if(existed){
//       await User.findOneAndUpdate(
//         {_id : userId , "cart.product" : productId},
//         {$inc : {"cart.$.quantity" : quantity ? quantity : 1} },
//         {new : true}
//       )
//       return res.status(200).json({message : "Item already in the cart"})
//     }else{
//       // Update the isOnCart field for the product
//       await Product.findByIdAndUpdate(productId, { isOnCart: true });
      
//       // Add the product to the user's cart
//       await User.findByIdAndUpdate(
//         {_id : userId},
//         {
//           $push : {
//             cart : {
//               product : productId,
//               quantity : quantity ? quantity : 1
//             }
//           }
//         },
//         {
//           new : true
//         }
//       )
//       return res.status(200).json({message : "Item added to the cart"})
//     }
//   } catch (error) {
//    res.render("404")
//     console.log(error)
//   }
// }


// exports.addToCart = async (req, res) => {
//   try {
//     const userDetail = req.session.user;
//     const userId = userDetail._id;
//     const { quantity } = req.body;
//     const productId = req.body.productId.trim();

//     const product = await Product.findById(productId);
//     const stock = product.stock;

//     if (quantity > stock) {
//       return res.status(400).json({ message: "Out of Stock" });
//     }

//     const existed = await User.findOne({
//       _id: userId,
//       "cart.product": productId,
//     });

//     if (existed) {
//       await User.findOneAndUpdate(
//         { _id: userId, "cart.product": productId },
//         { $inc: { "cart.$.quantity": quantity ? quantity : 1 } },
//         { new: true }
//       );
//       return res.status(200).json({ message: "Item already in the cart" });
//     } else {
//       // Update the isOnCart field for the product
//       await Product.findByIdAndUpdate(productId, { isOnCart: true });

//       // Add the product to the user's cart
//       await User.findByIdAndUpdate(
//         { _id: userId },
//         {
//           $push: {
//             cart: {
//               product: productId,
//               quantity: quantity ? quantity : 1,
//             },
//           },
//         },
//         {
//           new: true,
//         }
//       );
//       return res.status(200).json({ message: "Item added to the cart" });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

exports.addToCart = async (req, res) => {
  try {
    const userDetail = req.session.user;
    const userId = userDetail._id;
    const { quantity } = req.body;
    const productId = req.body.productId.trim();

    const product = await Product.findById(productId);
    const stock = product.stock;

    if (quantity > stock) {
      return res.status(400).json({ message: "Out of Stock" });
    }

    const existed = await User.findOne({
      _id: userId,
      "cart.product": productId,
    });

    if (existed) {
      return res.status(200).json({ message: "Item already in the cart" });
    } else {
      // Update the isOnCart field for the product
      await Product.findByIdAndUpdate(productId, { isOnCart: true });

      // Add the product to the user's cart
      await User.findByIdAndUpdate(
        { _id: userId },
        {
          $push: {
            cart: {
              product: productId,
              quantity: quantity ? quantity : 1,
            },
          },
        },
        {
          new: true,
        }
      );
      return res.status(200).json({ message: "Item added to the cart" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getStock = async (req, res) => {
  try {
    console.log(212)
    const productId = req.query.productId;
    console.log(214,productId)
    const product = await Product.findById(productId);


    const selectedStock = product.stock

    res.status(200).json({ stock: selectedStock });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


exports.updateCart = async (req, res) => {
  try {
    const userDetail = req.session.user;

    const data = await User.find(
      { _id: userDetail._id },
      { _id: 0, cart: 1 }
    ).lean();

    data[0].cart.forEach((val, i) => {
      val.quantity = req.body.datas[i].quantity;
    });

    await User.updateOne(
      { _id: userDetail._id },
      { $set: { cart: data[0].cart } }
    );
    res.status(200).send();
  } catch (error) {
  res.render("404")
    console.log(error.message);
  }
};

exports.removeFromCart = async (req,res)=>{
  try {
    const userDetail = req.session.user;
    const userId = userDetail._id;
    const productId = req.query.productId;
    const cartId = req.query.cartId;
    const newP = await Product.findById(productId);
    await Product.findOneAndUpdate(
      {_id : productId},
      {$set : {isOnCart : false}},
      {new : true}
    )

    await User.findOneAndUpdate(
      {_id : userId},
      {$pull : {cart : { product : productId}}},
      {new : true},

      res.status(200).send()
    )
  } catch (error) {
   res.render("404")
    console.log(error)
  }
}

exports.validateCoupon = async (req, res) => {
  try {
    const { coupon, subTotal } = req.body;

    console.log(152 , coupon , subTotal)

    const couponData = await Coupon.findOne({ code: coupon });
    console.log(155, couponData)

    if (!couponData) {
      res.json("invalid");
    } else if (couponData.expiryDate < new Date()) {
      res.json("expired");
    } else {
      const couponId = couponData._id;
      const discount = couponData.discount;
      const minDiscount = couponData.minDiscount;
      const maxDiscount = couponData.maxDiscount;
      const userId = req.session.user._id;

      const couponUsed = await Coupon.findOne({
        _id: couponId,
        usedBy: { $in: [userId] },
      });

      if (couponUsed) {
        res.json("already used");
      } else {
        let discountAmount;
        let maximum;

        const discountValue = Number(discount);
        const couponDiscount = (subTotal * discountValue) / 100;

        if (couponDiscount < minDiscount) {
          res.json("minimum value not met");
        } else {
          if (couponDiscount > maxDiscount) {
            discountAmount = maxDiscount;
            maximum = "maximum";
          } else {
            discountAmount = couponDiscount;
          }

          const newTotal = subTotal - discountAmount;
          const couponName = coupon;

          res.json({
            couponName,
            discountAmount,
            newTotal,
            maximum,
          });
        }
      }
    }
  } catch (error) {
   res.render("404")
    console.log(error.message);
  }
};
  
exports.loadCheckout = async  (req,res)=>{
try {
  const userDetail = req.session.user
  const userId = userDetail._id

  const categoryData = await Category.find({isBlocked : false})
  const addressData = await Address.find({userId : userId});
  const userCart = await User.findOne({_id : userId}).populate("cart.product").lean();

  const cart = userCart.cart
  let subTotal = 0;
  
  cart.forEach((element) => {
    element.total = element.product.price * element.quantity;
    subTotal += element.total;
  });

  const now = new Date();

  const availableCoupons = await Coupon.find({
    expiryDate: { $gte: now },
    usedBy: { $nin: [userId] },
    status: true,
  });
  res.render("checkout" , {categoryData , userDetail , addressData , subTotal , cart , availableCoupons})
} catch (error) {
  res.render("404")
  console.log(error)
}
}

exports.loadWishlist = async (req, res) => {
  try {
      const userData = req.session.user;
      const userId = userData._id;
      const categoryData = await Category.find({ is_blocked: false });

      const user = await User.findById(userId).populate("wishlist");
      const wishlistItems = user.wishlist;

      const userCart = await User.findOne({ _id: userId }).populate("cart.product").lean();
      const cart = userCart.cart;

      if (wishlistItems.length === 0) {
          res.render("emptyWishlist", { userData, categoryData });
      } else {
          res.render("wishlist", { userData, categoryData, cart, wishlistItems });
      }
  } catch (error) {
      console.log(error.message);
  }
};