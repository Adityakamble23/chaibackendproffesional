import { asynchander } from "../utils/asynchander.js";
import { ApiError } from "../utils/apierror.js";
import User from "../models/user.model.js";
import { uoloadcloudnary } from "../utils/cloudnary.js";
import { Apiresponce } from "../utils/apiresponce.js";
import jwt from "jsonwebtoken";
import e from "express";

const registerUser = asynchander(async (req, res) => {
  const { fullname, email, username, password } = req.body;
  console.log(req.body, "ohh this is gona happing ");

  if (
    [fullname, password, email, username].some((filed) => filed?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existeduser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existeduser) {
    throw new ApiError(409, "User already exists with this email or username");
  }
  const avatarlocalpath = req.files?.avatar?.[0]?.path;
  // const coverimagelocalpath = req.files?.coverImage?.[0]?.path;
  let coverimagelocalpath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverimagelocalpath = req.files.coverImage[0].path;
  } else {
    coverimagelocalpath = null;
  }

  if (!avatarlocalpath) {
    throw new ApiError(400, "Avatar is required");
  }
  const avatar = await uoloadcloudnary(avatarlocalpath);
  let coverImage;
  if (coverimagelocalpath !== null) {
    coverImage = await uoloadcloudnary(coverimagelocalpath);
  } else {
    coverImage = { url: "" };
  }
  if (!avatar) {
    throw new ApiError(400, "Error while uploading avatar image");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage.url,
    email,
    password,
    username: username.toLowerCase(),
  });

  const createduser = await User.findById(user._id)
    .select("-password -refreshToken")
    .then(console.log("User registered successfully"));

  if (!createduser) {
    throw new ApiError(500, "Something went wrong while resgitering  user");
  }
  return res
    .status(201)
    .json(new Apiresponce("User registered successfully", 201, createduser));
});

const generateacessandresfreshtoken = async (userid) => {
  try {
    const user = await User.findById(userid);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const accesstoken = user.generateaccesstoken();
    const refreshtoken = user.generaterefreshtoken();
    user.refreshToken = refreshtoken;
    await user.save({ validateBeforeSave: false });
    return { accesstoken, refreshtoken };
  } catch (error) {
    console.error("Token generation error:", error);
    throw new ApiError(500, `Error while generating tokens: ${error.message}`);
  }
};

const loginUser = asynchander(async (req, res) => {
  // Login logic will be here
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  // send cookie

  const { username, password, email } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }
  console.log(req.body, "this is login body");
  const existeduser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!existeduser) {
    //check password
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await existeduser.ispasswordcorrect(password);
  if (!isPasswordCorrect) {
    //check password
    throw new ApiError(401, "password is incorrect");
  }

  const { accesstoken, refreshtoken } = await generateacessandresfreshtoken(
    existeduser._id
  );

  const logedinuser = await User.findById(existeduser._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accesstoken, options)
    .cookie("refreshToken", refreshtoken, options)
    .json(
      new Apiresponce("User logged in successfully", 200, {
        user: logedinuser,
        accesstoken,
        refreshtoken,
      })
    );
});

const logoutUser = asynchander(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", null, options)
    .cookie("refeshtoken", null, options)
    .json(new Apiresponce("User logged out successfully", 200, null));
});

const refreshaccesstoken = asynchander(async (req, res) => {
  const incomingrefreshtoken =
    req.cookies?.refreshToken || req.body?.refreshToken;
  if (!incomingrefreshtoken) {
    throw new ApiError(401, "Refresh Token is unauthorized");
  }
  console.log(incomingrefreshtoken, "this is incoming refreshtoken");
  try {
    const decodedtoken = jwt.verify(
      incomingrefreshtoken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedtoken._id);
    console.log(user, "this is user from db");
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }
    console.log(user.refreshToken, "this is user refreshtoken");

    if (user.refreshToken !== incomingrefreshtoken) {
      throw new ApiError(401, "Refresh Token mismatch or expired");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };
    const { accesstoken, newrefreshtoken } =
      await generateacessandresfreshtoken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accesstoken, options)
      .cookie("refreshToken", newrefreshtoken, options)
      .json(
        new Apiresponce("Access token refreshed successfully", 200, {
          accesstoken,
          refreshtoken: newrefreshtoken,
        })
      );
  } catch (error) {
    throw new ApiError(
      401,
      "Invalid or expired Refresh Token or somthing went wrong"
    );
  }
});

export { registerUser, loginUser, logoutUser, refreshaccesstoken };
