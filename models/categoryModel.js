const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({

  category : {
      type : String,
      required : true
  },

  imageUrl : {
    public_id : {
      type : String,
      required : true
    },
    url : {
      type : String,
      required : true
    }
  }, 

  description : {
    type : String,
    required : true
  },

  isBlocked : {
    type : Boolean,
    default : false
  }
})

module.exports = mongoose.model("category",categorySchema)