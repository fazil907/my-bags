const User = require("../../models/userModel");

const credentials = {
  email: "admin@gmail.com",
  password: "123",
};

exports.adminLogin = (req, res) => {
  try {
    if (req.session.admin) {
      res.redirect("/admin/dashboard");
    } else {
      res.render("adminLogin");
    }
  } catch (error) {
    console.log(error);
  }
};

exports.loginPost = async (req, res) => {
  try {
    const valid = await adminLoginValidation(req.body);
    if (valid.isValid) {
      req.session.admin = req.body.loginEmail;
      return res.status(200).end();
    } else {
      return res.status(400).json({ error: valid.errors });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.adminLogout = (req, res) => {
  try {
    delete req.session.admin;
    res.redirect("/admin");
  } catch (error) {
    console.log(error);
  }
};

async function adminLoginValidation(data) {
  const { loginEmail, loginPassword } = data;
  const errors = {};

  // if (!loginEmail) {
  //   errors.emailError = "Please Enter an Email";
  // }

  if (loginEmail && !loginPassword) {
    errors.passwordError = "Password not entered";
  }

  if (
    loginEmail !== credentials.email ||
    loginPassword !== credentials.password
  ) {
    errors.credentialsError = "Incorrect email or password";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
