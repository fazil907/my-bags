const User = require("../../models/userModel");

async function validation(data){
  const {name, email, phone , password , confirmPassword} = data;
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

  const existingUser = await User.findOne({email : email});

  if(!email){
    errors.emailError = "Please Enter an Email"
  }else if(!emailRegex.test(email)){
    errors.emailError = "Please provide a valid Email"
  }else if(existingUser && email == existingUser.email){
    errors.emailError = "This email is already registered"
  }

  if(!name){
    errors.nameError = "Please enter a Name"
  }

  if(!phone){
    errors.phoneError = "Please provide a Phone Number"
  }else if(!phoneRegex.test(phone)){
    errors.phoneError = "Invalid Phone Number"
  }else if(existingUser && phone == existingUser.phone){
    errors.phoneError = "This phone number is already registered"
  }

  if(!password){
    errors.passwordError = "Please provide a password";
  }else if(!passwordRegex.test(password)){
    errors.passwordError = "Password must be 8 characters with one uppercase, one lowercase and one number"
  }

  if(password != confirmPassword && password.length > 0){
    errors.confirmPasswordError = "The passwords do not match"
  };

  return{
    isValid: Object.keys(errors).length === 0, errors
  }
}

exports.signUpPost = async (req,res) => {
  try {
    const data = {
      name : req.body.name,
      email : req.body.email,
      phone : req.body.phone,
      password : req.body.password,
    };

    req.session.detail = data;
    
    const valid = await validation(req.body)
    
    if(valid.isValid){
      return res.status(200).end()
    }else{
      return res.status(400).json({error : valid.errors})
    }
  } catch (error) {
   res.render("404")
    console.log(error);
    return res.status(500).json({error : "Internal server error"})
  }
}