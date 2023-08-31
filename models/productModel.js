const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name : {
    type : String,
    required : true
  },

  price : {
    type : String,
    required : true
  },

  description : {
    type : String,
    required : true
  },

  category : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "category",
    required : true
  },

  imageUrl : [{
    public_id: {
      type : String,
      required : true
    },

    url : {
      type : String,
      required : true
    }
  }],

  stock : {
    type : Number,
    required : true
  },
  
  isOnCart : {
    type : Boolean,
    default : false
  },

  available:{
    type:Boolean,
    default:true,
}
})


module.exports = mongoose.model("Product", productSchema)