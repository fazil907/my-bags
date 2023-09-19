const User = require("../../models/userModel");
const Category = require("../../models/categoryModel");
const Product = require("../../models/productModel");
const { default: mongoose } = require("mongoose");



// exports.getProducts = async (req,res)=>{
// try {
//     const userDetail = req.session.user
//     const productData = await Product.find({available : true}).populate('category')
//     const categoryData = await Category.find({isBlocked : false}) 

//     res.render("userProducts" , {productData , categoryData , userDetail})
// } catch (error) {
//   res.render("404")
//   console.log(error)
// }
// }

exports.getProducts = async (req, res) => {
  const categoryData = await Category.find({ isBlocked: false });
  const categoryFilterData = await Category.find({ isBlocked: false });

  try {
    const page = parseInt(req.query.allProductsPage) || 1;
    const productsPerPage = 5;

    categoryFilterData.forEach(async (category, index) => {
      const productCount = await Product.countDocuments({ category: category._id });
      categoryFilterData[index].productCount = productCount;
    });


    let productData;

    const search = req.query.search;

    if (search) {
      productData = await Product.find({
        name: { $regex: ".*" + search + ".*", $options: "i" },
      })
        .skip((page - 1) * productsPerPage)
        .limit(productsPerPage);

        console.log(productData);
    } else {
      productData = await Product.find()
        .skip((page - 1) * productsPerPage)
        .limit(productsPerPage);
    }

    const totalCount = search
      ? await Product.countDocuments({ name: { $regex: ".*" + search + ".*", $options: "i" } })
      : await Product.countDocuments();

    const totalPages = Math.ceil(totalCount / productsPerPage);

    let noProductsFound = false;
    if (search && productData.length === 0) {
      noProductsFound = true;
    }


    if (req.session.user) {
      const userDetail = req.session.user;
      res.render("userProducts", {
        title: "All Products",
        userDetail,
        productData,
        categoryData,
        categoryFilterData,
        currentPage: page,
        totalPages,
        noProductsFound,
      });
    } else {
      res.render("userProducts", {
        title: "All Products",
        productData,
        categoryData,
        categoryFilterData,
        currentPage: page,
        totalPages,
        noProductsFound,
      });
    }
  } catch (error) {
    console.log(error.message);
    const userData = req.session.user;
    res.render("404", { userData, categoryData });
  }
};



// exports.getCategoryProducts = async (req, res) => {
//   try {
//     const userDetail = req.session.user
//     const categoryId = req.params.id;
//     const categoryData = await Category.find({isBlocked : false})

//     const productData = await Product.find({ category: categoryId , available : true} );
//     console.log(productData)

//     res.render("userProducts", { productData , categoryData , userDetail});
//   } catch (error) {
//     res.render("404")
//     console.log(error);
//   }
// };      

exports.getCategoryProducts = async (req, res) => {
  try {
  const categoryData = await Category.find({ isBlocked: false });
  const categoryFilterData = await Category.find({ isBlocked: false });

  const userDetail = req.session.user;  

    const page = parseInt(req.query.page) || 1;
    const productsPerPage = 5;

    const id = req.params.id;
    let productData;
    let totalCount;
    let subCategoryData = [];

    categoryFilterData.forEach(async (category, index) => {
      const productCount = await Product.countDocuments({ category: category._id });
      categoryFilterData[index].productCount = productCount;
    });

    const isCategory = await Category.exists({ _id: id });


    if (isCategory) {
      productData = await Product.find({ category: id, available: true })

        .skip((page - 1) * productsPerPage)
        .limit(productsPerPage);
      totalCount = await Product.countDocuments({
        category: id,
        available: true,
      });
    }


    const totalPages = Math.ceil(totalCount / productsPerPage);



    if (userDetail) {
      res.render("userProducts", {
        title: "Products",
        categoryData,
        userDetail,
        productData,
        categoryFilterData,
        currentPage: page,
        totalPages,
        id: id,
        category: isCategory,
      });
    } else {
      res.render("userProducts", {
        title: "Products",
        categoryData,
        subCategoryData,
        productData,
        categoryFilterData,
        currentPage: page,
        totalPages,
        id: id,
        category: isCategory,
      });
    }
  } catch (error) {
    console.log(error);
    const userData = req.session.user;
    const categoryData = await Category.find({ isBlocked: false });
    res.render("404", { userData, categoryData });
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
    console.log(211,productData);
    // console.log("203",productData);
    res.json(productData);
  } catch (error) {
   res.render("404")
    console.log(error.message);
  }
};