const User = require('../../models/userModel');
const Category = require('../../models/categoryModel')
const Cloudinary = require('../../config/cloudinary')

exports.loadCategory = async (req,res)=>{
  try {
    const categoryData = await Category.find()
    res.render('category', {categoryData})
  } catch (error) {
    console.log(error)
  }
}

exports.addCategory = (req,res)=>{
  try {
   res.render('addCategory', {user : req.session.admin})
 } catch (error) {
  console.log(error)
 }
}


exports.addNewCategory = async (req,res)=>{
  const image = req.file;
  const categoryName = req.body.categoryName
  const categoryDescription = req.body.categoryDescription;
  const lowerCategoryName = categoryName.toLowerCase();
  try {

    const result = await Cloudinary.uploader.upload(image.path ,{
      folder : "Categories"
    })

    const categoryExist = await Category.findOne({
      category : lowerCategoryName
    })

    if(!categoryExist){
      const newCategory = new Category({
        imageUrl : {
          public_id : result.public_id,
          url : result.secure_url
        },
        category : lowerCategoryName,
        description : categoryDescription,
        isBlocked : false
      })

      await newCategory.save();
      req.session.categorySave = true;
      
      res.redirect('/admin/category')
    }

  } catch (error) {
    console.log(error)
  }
}


exports.editCategory = async (req,res)=>{
  const categoryId = req.params.id;
  try {
    const categoryData = await Category.findById({_id: categoryId});
    res.render('editCategory', {categoryData , user : req.session.admin})
  } catch (error) {
    console.log(error)
  }
}

exports.updateCategory = async (req,res)=>{
  try {
  const categoryId = req.params.id;
  const categoryName = req.body.categoryName;
  const categoryDescription = req.body.categoryDescription
  const newImage = req.file
  // console.log(27, categoryName , categoryDescription)

    const categoryData = await Category.findById({_id: categoryId});
    const categoryImageUrl = categoryData.imageUrl.url
    
    // console.log(82,categoryData);
    // console.log(83, categoryImageUrl)
    let result;
  
    if(newImage){
      if(categoryImageUrl){
        await Cloudinary.uploader.destroy(categoryData.imageUrl.public_id)
      }
  
      result = await Cloudinary.uploader.upload(newImage.path , {
        folder : "Categories"
      })
    }else{
      result = {
        public_id : categoryData.imageUrl.public_id,
        secure_url : categoryImageUrl
      } 
    }
  
    const catExist = await Category.findOne({category : categoryName});
    const imageExist = await Category.findOne({
      "imageUrl.url" : result.secure_url
    })
    const descriptionExist = await Category.findOne({description : categoryDescription}) 
    
    if(!catExist || !imageExist || !descriptionExist){
      const changed = await Category.findOneAndUpdate(
        {_id: categoryId},
        {
          category : categoryName,
          imageUrl : {
            public_id : result.public_id,
            url : result.secure_url
          },
          description : categoryDescription
        },
        {
          new : true
        }
      )
      // console.log(122, changed )
      req.session.categoryUpdate = true;
      res.redirect('/admin/category')
    }else{
      req.session.categoryExist = true;
      res.redirect("/admin/category")
    }
} catch (error) {
  console.log(error)
}
}

exports.unListCategory = async (req,res)=>{
  const categoryId = req.params.id;
  const unList = await Category.findById(categoryId)
  const categoryData = await Category.findById(categoryId)

  await Category.findByIdAndUpdate(categoryId, {$set : { isBlocked : !unList.isBlocked }})
  res.redirect('/admin/category')
}