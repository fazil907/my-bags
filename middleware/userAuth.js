const User = require("../models/userModel");

// const blockCheck = async (req, res, next) => {
//   try {
//     if (req.body) {
//       const email = req.body.loginEmail;
//       const user = await User.findOne({email});
//       if (user.isBlocked) {
//         return res.status(401).json({message : "You have been blocked"})
//       } else {
//         next();
//       }
//     } else {
//       next();
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };

// const isLogin = async (req,res,next)=>{
//   try {
//     if(!req.session.user){
//       res.redirect("/login")
//     }else{
//       next()
//     }
//   } catch (error) {
//     console.log(error)
//   }
// }

// module.exports = {
//   blockCheck,
//   isLogin
// };
// blockCheck middleware
const blockCheck = async (req, res, next) => {
  try {
    if (req.body && req.body.loginEmail) {
      const email = req.body.loginEmail;
      const user = await User.findOne({ email });

      if (user && user.isBlocked) {
        return res.status(401).json({ message: "You have been blocked" });
      }
    }
    
    // Continue to the next middleware
    next();
  } catch (error) {
    console.log(error);
    // Handle error
    res.status(500).json({ message: "Internal server error" });
  }
};

// isLogin middleware
const isLogin = (req, res, next) => {
  try {
    if (!req.session.user) {
      // Redirect to login only if the user is not trying to access specific pages
      const allowedRoutes = ["/login", "/register"]; // Add more routes if needed
      if (!allowedRoutes.includes(req.path)) {
        return res.redirect("/login");
      }
    }
    // User is logged in or accessing an allowed route
    next();
  } catch (error) {
    console.log(error);
    // Handle error
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  blockCheck,
  isLogin,
};
