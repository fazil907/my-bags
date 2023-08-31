const User = require('../../models/userModel');
const Category = require('../../models/categoryModel');
const Cloudinary = require('../../config/cloudinary')
const Product = require("../../models/productModel")


exports.getProduct = async (req,res)=>{
  try {
    const productData = await Product.find().populate("category")
    // const categories = await Category.find()
    res.render('product' , {productData})
  } catch (error) {
    console.log(error)
  }
}


exports.getAddProduct = async (req,res)=>{
  const categories = await Category.find();
  res.render("addProduct" , {categories})
}


exports.addNewProduct = async (req,res)=>{
  try {
    const {name, price , stock , category, description} = req.body
    const images = req.files;
    const uploadedImages = [];
    console.log(28,images)
    console.log(29,name,price,stock,category,description)
    for(let image of images){
      const  result = await Cloudinary.uploader.upload(image.path, {
        folder : "Products"
      })

      console.log(35,result)
      uploadedImages.push({
        public_id : result.public_id,
        url : result.secure_url
      })
    }



    const newProduct = new Product({
      name,
      price,
      description,
      category,
      imageUrl : uploadedImages,
      stock
    })
    console.log(52,newProduct)
    await newProduct.save()

    req.session.products = true;
    res.redirect('/admin/products')
  } catch (error) {
    console.log(error)
  }
}


exports.getEditProduct = async (req,res)=>{
  const categories = await Category.find()
  const productId = req.params.id
  const productToEdit = await Product.findById(productId)
  res.render("editProduct" , {productToEdit , categories})
}

exports.updateProduct = async (req,res)=>{
 try {
   const productId = req.params.id;
   const productToEdit = await Product.findById(productId);
   const existImage = productToEdit.imageUrl;

   let newImages = [];

   const files = req.file;
    console.log(80,files)
 
   if(files){
     const result = await Cloudinary.uploader.upload(files.path , {
       folder : "Products"
     })

    
 
     const Image = {
       public_id : result.public_id,
       url : result.secure_url
     }
 
     newImages.push(Image)
     console.log(95,newImages)
   }
  
 
   const {
     name,
     price,
     stock,
     category,
     description,
     imageCheckbox 
 
   } =   req.body
 
   const selectedImages = imageCheckbox.map((index) => existImage[index])
   productToEdit.imageUrl = selectedImages;

   uploadedImages = [...newImages , ...selectedImages];

    console.log(uploadedImages)

   await Product.findByIdAndUpdate(productId , 
     {
       name : name,
       price : price,
       description : description,
       category : category,
       imageUrl : uploadedImages,
       stock : stock,
     },
     {
       new : true
     })
 
     res.redirect('/admin/products')
 } catch (error) {
  console.log(error)
 }
}

exports.deleteProduct = async (req, res) => {
  try {
    const Id = req.params.id
    console.log(Id)
    const productAvailable= await Product.findById(Id)
    await Product.findByIdAndUpdate(Id,{$set:{available:!productAvailable.available}})
      
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
  }
};