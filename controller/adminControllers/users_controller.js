const User = require('../../models/userModel');

exports.getUsers = async (req,res)=>{
  try {
    const users = await User.find()
    res.render('users', {users : users})
  } catch (error) {
      console.log(error)
  }
}

exports.userBlock = async  (req,res)=>{
try {
    const Id = req.params.id;
    console.log(Id);
    await User.findByIdAndUpdate(Id , {$set : {isBlocked : true}}, {new: true});
    res.redirect('/admin/users')
  
} catch (error) {
  console.log(error)
}
}

exports.userUnblock = async (req,res)=>{
  try {
    const Id = req.params.id;
    await User.findByIdAndUpdate(Id, {$set : {isBlocked : false}}, {new: true});
    res.redirect('/admin/users')
  } catch (error) {
    console.log(error);
  }
}