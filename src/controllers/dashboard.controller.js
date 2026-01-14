import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const userId = req.params.userId || req.user._id;
  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }
  const checkuser = await User.findById(userId);
  if (!checkuser) {
    throw new ApiError(404, "User not found");
  }

  const videos = await Video.find({ owner: userId, isPublished: true }).sort({
    createdAt: -1,
  });
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Channel videos fetched successfully", { videos })
    );
});

export { getChannelStats, getChannelVideos };
