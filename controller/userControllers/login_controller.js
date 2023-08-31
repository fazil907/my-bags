const User = require("../../models/userModel");
const Category = require('../../models/categoryModel')
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer")
const { blockCheck } = require("../../middleware/userAuth");

exports.loginPage = async (req, res) => {
 try {
   const categoryData = await Category.find({isBlocked : false})
   if (req.session.user) {
     res.redirect("/");
   } else {
     res.render("login" , {categoryData});
   }
 } catch (error) {
  res.render("404")
 }
};

exports.loginPost = async (req, res) => {
  const email = req.body.loginEmail;
  const valid = await loginValidation(req.body);
  const userData = await User.findOne({ email: email });
  if (valid.isValid) {
    req.session.user = userData;
    return res.status(200).json({ email: req.session.user });
  } else {
    return res.status(400).json({ error: valid.errors });
  }
};

async function loginValidation(data) {
  const { loginEmail, loginPassword } = data;
  const errors = {};

  if (!loginEmail) {
    errors.loginEmailError = "Please provide an Email";
  }

  if (loginEmail && !loginPassword) {
    errors.loginPasswordError = "Password not entered";
  }

  if (loginEmail && loginPassword) {
    const existingUser = await User.findOne({ email: loginEmail });

    if (!existingUser) {
      errors.loginError = "Incorrect email or Password";
    } else {
      const isPasswordValid = await bcrypt.compare(
        loginPassword,
        existingUser.password
      );
      if (!isPasswordValid) {
        errors.incorrectPassword = "Incorrect Password";
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}



// forgot password

exports.forgotPassword = async (req,res)=>{
  try {
    
    res.render("forgotPassword")
  } catch (error) {
   res.render("404")
    console.log(error)
  }
}

exports.verifyForgotEmail = async (req, res) => {
  try {
    const { email } = req.body;
    req.session.userEmail = email;
    const existingEmail = await User.findOne({ email });
    if (!existingEmail) {
      return res.status(400).json({ error: "This email is not registered" });
    } else {
      return res.status(200).end();
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

let otp;
const otpGenerator = () => {
  const otp = Math.floor(1000 + Math.random() * 9000);
  return otp.toString();
};

async function sendForgotPasswordOtp(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "OTP Verification",
      text: `The OTP for your verification is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error occurred:", error);
        return;
      } else {
        console.log("Email sent successfully!");
      }
    });
  } catch (error) {
   res.render("404")
    console.log(error);
  }
}

exports.forgotPasswordOtp = (req, res) => {
  try {
    otp = otpGenerator();
    let forgotPasswordOtp = otp;
    console.log(otp);
    const email = req.session.userEmail;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    sendForgotPasswordOtp(email, otp);

    res.render("forgotOtpEnter");
    setTimeout(() => {
      forgotPasswordOtp = null;
      console.log("otp removed");
    }, 60 * 1000);
  } catch (error) {
   res.render("404")
    console.log(error);
  }
};

exports.verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { first, second, third, fourth } = req.body;
    let enteredOtp;
    enteredOtp = first + second + third + fourth;

    if (enteredOtp === otp) {
      return res.status(200).end();
    } else {
      return res.status(400).json({ error: "Invalid OTP!" });
    }
  } catch (error) {
   res.render("404")
    console.log(error)
  }
};

exports.loadResetPassword = (req, res) => {
  try {
   if(req.session.userEmail){ 
    res.render("resetPassword");
   }else{
      res.redirect("/login")
   }
  } catch (error) {
   res.render("404")
    console.log(error)
  }
};

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

exports.verifyResetPassword = async (req, res) => {
  try {
    const email = req.session.userEmail;
   
    const newPassword = req.body.password;
   
    const hashedPassword = await securePassword(newPassword);
   
    const userData = await User.findOneAndUpdate(
      { email: email },
      { $set: { password: hashedPassword } }
    );

    if (userData) {
      res.redirect("/login");
      delete req.session.userEmail;
    } else {
      console.log("something error happened");
    }
  } catch (error) {
   res.render("404")
    console.log(error);
  }
};