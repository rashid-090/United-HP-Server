const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const District = require("./districtModel");
const City = require("./cityModel");
const State = require("./stateModel");

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    address: {
      type: String,
    },
    contactNumber: {
      type: Number,
    },
    pinCode: {
      type: Number
    },
    gMapLink: {
      type: String
    },
    gMapLinkShorten: {
      type: String
    },
    // permissions: {
    //   type: [String],

    //   default: []
    // }, // Array to store permissions

    permissions: {
      manageBanner: {
        type: Boolean,
        default: false,
      },
      manageLocation: {
        type: Boolean,
        default: false,
      },
      manageDealers: {
        type: Boolean,
        default: false,
      },
      manageEnquiries: {
        type: Boolean,
        default: false,
      },
    },
    openingTime: {
      type: String
    },
    closingTime: {
      type: String
    },
    about: {
      type: String
    },
    profileImgURL: {
      type: String
    },
    brand: {
      type: String
    },
    state: {
      type: Schema.Types.ObjectId,
      ref: State,
    },
    district: {
      type: Schema.Types.ObjectId,
      ref: District,
    },
    city: {
      type: Schema.Types.ObjectId,
      ref: City,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin", "superAdmin"],
    },
    isActive: {
      type: Boolean,
      required: true,
    },
    imgURL: [
      {
        type: String,
      }
    ],
    location: {
      type: {
        type: String, // Must be "Point"
        enum: ['Point'], // 'location.type' must be 'Point'

      },
      coordinates: {
        type: [Number], // [longitude, latitude]

      },
    },

    isEmailVerified: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

UserSchema.index({ location: '2dsphere' });


UserSchema.statics.signup = async function (
  userCredentials,
  role,
  isEmailVerified
) {
  const { email, password, passwordAgain, name } =
    userCredentials;



  if (
    !name ||
    !email ||
    !password ||
    !passwordAgain ||
    !role
  ) {
    throw Error("All fields are required");
  }








  if (name.trim() === "" || email.trim() === "") {
    throw Error("All Fields are required");
  }

  if (password !== passwordAgain) {
    throw Error("Password is not match");
  }

  if (!validator.isEmail(email)) {
    throw Error("Email is not valid");
  }

  if (!validator.isStrongPassword(password)) {
    throw Error("Password is not strong enough");
  }

  // Checking if the email is already registered.
  const exists = await this.findOne({ email });
  if (exists) {
    throw Error("Email already in use");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  userCredentials["password"] = hash;

  delete userCredentials["passwordAgain"];

  const user = await this.create({
    ...userCredentials,
    isActive: true,
    role,
    isEmailVerified,
  });

  user.password = "";

  return user;
};

UserSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error("All fields are required");
  }

  if (!validator.isEmail(email)) {
    throw Error("Email is not valid");
  }

  let user = await this.findOne({ email });

  // let user = await this.findOne({ email, isActive: true });

  if (!user) {
    throw Error("This email is not registered. Please check!");
  }
  if (!user.isActive) {
    throw Error(
      "Your account is blocked. Contact customer care for further details"
    );
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw Error("Incorrect Password");
  }

  user.password = "";

  return user;
};

UserSchema.statics.changePassword = async function (
  _id,
  currentPassword,
  password,
  passwordAgain
) {
  if (password !== passwordAgain) {
    throw Error("Password doesn't match");
  }

  if (!validator.isStrongPassword(password)) {
    throw Error("Password is not strong enough");
  }
  const exists = await this.findOne({ _id });
  if (!exists) {
    throw Error("Cannot find email");
  }

  const match = await bcrypt.compare(currentPassword, exists.password);

  if (!match) {
    throw Error("Current Password is wrong");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  let user = await this.updateOne({ _id }, { $set: { password: hash } });

  user.password = "";

  return user;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
