const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const createToken = (_id, role, permissions) => {
  return jwt.sign({ _id, role, permissions }, process.env.SECRET, { expiresIn: "1d" });
};

const cookieConfig = {
  httpOnly: true,
  secure: true,        // make sure your site uses HTTPS
  sameSite: "none",    // only for cross-site cookies
  maxAge: 1000 * 60 * 60 * 24,
};

// To get user data on initial page load.
const getUserDataFirst = async (req, res) => {
  try {
    const token = req.cookies.user_token;
    if (!token) {
      throw Error("No token found");
    }

    const { _id } = jwt.verify(token, process.env.SECRET);

    const user = await User.findOne({ _id }, { password: 0 });

    if (!user) {
      throw Error("Cannot find user");
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const signUpUser = async (req, res) => {
  try {
    let userCredentials = req.body;

    const profileImgURL = req?.file?.filename;

    if (profileImgURL) {
      userCredentials = { ...userCredentials, profileImgURL: profileImgURL };
    }

    const user = await User.signup(userCredentials, "superAdmin", true);

    const token = createToken(user._id, user.role, user.permissions);

    res.cookie("user_token", token, cookieConfig);

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);

    const token = createToken(user._id, user.role, user.permissions);

    res.cookie("user_token", token, cookieConfig);

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const logoutUser = async (req, res) => {
  res.clearCookie("user_token", {
    sameSite: "none",
    secure: true,
    httpOnly: true,
  });

  res.status(200).json({ msg: "Logged out Successfully" });
};

const editUser = async (req, res) => {
  try {
    const token = req.cookies.user_token;

    const { _id } = jwt.verify(token, process.env.SECRET);

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw Error("Invalid ID!!!");
    }



    const sanitizeInput = (data) => {
      if (data.contactNumber === "null" || data.contactNumber === "") {
        data.contactNumber = null;
      }
      return data;
    };
    
    // Use this in your controller
    let formData = sanitizeInput(req.body);

    const profileImgURL = req?.file?.filename;

    if (profileImgURL) {
      formData = { ...formData, profileImgURL: profileImgURL };
    }

    // Check if the new email already exists
    if (formData.email) {
      const emailExists = await User.findOne({ email: formData.email, _id: { $ne: _id } });
      if (emailExists) {
        throw Error("Email already in use!");
      }
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id },
      { $set: { ...formData } },
      { new: true }
    );

    if (!updatedUser) {
      throw Error("No such User");
    }

    const user = await User.findOne({ _id }, { password: 0 });

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const changePassword = async (req, res) => {
  try {
    const token = req.cookies.user_token;

    const { _id } = jwt.verify(token, process.env.SECRET);

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw Error("Invalid ID!!!");
    }

    const { currentPassword, password, passwordAgain } = req.body;

    const user = await User.changePassword(
      _id,
      currentPassword,
      password,
      passwordAgain
    );

    return res.status(200).json({ user, success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getUserDataFirst,
  signUpUser,
  loginUser,
  logoutUser,
  editUser,
  changePassword,
};
