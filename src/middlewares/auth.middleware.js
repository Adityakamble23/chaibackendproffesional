import { asynchander } from "../utils/asynchander.js";
import { ApiError } from "../utils/apierror.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
const veryfyJWT = asynchander(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    // console.log("Verifying token:", token);
    if (!token) {
      throw new ApiError(401, "Access token is missing");
    }

    const decodedtoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedtoken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "Invalid token - user not found");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid or expired access token");
  }
});

export { veryfyJWT };
