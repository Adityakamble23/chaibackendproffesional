import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userliked = req.user._id;
  if (!(videoId || !isValidObjectId(videoId))) {
    throw new ApiError(400, "Invalid video id");
  }
  if (!userliked || !isValidObjectId(userliked)) {
    throw new ApiError(400, "Invalid user id");
  }

  const likedcheck = await Like.findOne({
    video: videoId,
    likedBy: userliked,
  });

  if (!likedcheck) {
    const newlike = await Like.create({
      video: videoId,
      likedBy: userliked,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, "Video liked successfully", newlike));
  } else {
    await Like.findByIdAndDelete(likedcheck._id);
    return res
      .status(200)
      .json(new ApiResponse(200, "Video unliked successfully"));
  }

  //TODO: toggle like on video
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
