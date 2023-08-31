const User = require("../../models/userModel");
const Category = require("../../models/categoryModel");
const Product = require("../../models/productModel");
const { default: mongoose } = require("mongoose");



exports.getProducts = async (req,res)=>{
try {
    const userDetail = req.session.user
    const productData = await Product.find({available : true}).populate('category')
    const categoryData = await Category.find({isBlocked : false}) 
    // console.log(productData)
    res.render("userProducts" , {productData , categoryData , userDetail})
} catch (error) {
  res.render("404")
  console.log(error)
}
}

exports.getCategoryProducts = async (req, res) => {
  try {
    const userDetail = req.session.user
    const categoryId = req.params.id;
    const categoryData = await Category.find({isBlocked : false})

    const productData = await Product.find({ category: categoryId , available : true} );
    console.log(productData)

    res.render("userProducts", { productData , categoryData , userDetail});
  } catch (error) {
    res.render("404")
    console.log(error);
  }
};      


exports.getProductView = async (req,res)=>{
 try {
  const userDetail = req.session.user
  const productId = req.query.id;
  const categoryData = await Category.find({isBlocked : false})
  const productData = await Product.findById(productId).populate('category')
   const productDatas = await Product.aggregate([
    {
      $match: {
        _id: { $ne: new mongoose.Types.ObjectId(productId) }
      }
    }
  ])
   res.render("productView" , {productData , productDatas , categoryData , userDetail})
 } catch (error) { 
   res.render("404")
  console.log(error)
 }
}



exports.categoryFilter = async (req, res) => {
  try {
    const categoryId = req.query.categoryId;

    const productData = await Product.find({ category: categoryId });
    res.json(productData);
  } catch (error) {
   res.render("404")
    console.log(error.message);
  }
};