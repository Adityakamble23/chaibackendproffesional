import { asynchander } from "../utils/asynchander.js";
import { ApiError } from "../utils/apierror.js";
import User from "../models/user.model.js";
import { uoloadcloudnary } from "../utils/cloudnary.js";
import { Apiresponce } from "../utils/apiresponce.js";

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
  const coverimagelocalpath = req.files?.coverImage?.[0]?.path;

  if (!avatarlocalpath) {
    throw new ApiError(400, "Avatar is required");
  }
  const avatar = await uoloadcloudnary(avatarlocalpath);
  const coverImage = await uoloadcloudnary(coverimagelocalpath);
  if (!avatar) {
    throw new ApiError(400, "Error while uploading avatar image");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
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

export { registerUser };
