import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { userId, content } = req.body;
  if (!(userId && content)) {
    throw new ApiError(400, "userId and content are required");
  }
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid userId");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const tweet = await Tweet.create({ content, owner: userId });
  return res
    .status(201)
    .json(new ApiResponse(201, "Tweet created successfully", tweet));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // 1. Get userId from params (Standard for 'get' routes)
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid userId");
  }

  // 2. The Pipeline
  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner", // Let's name it 'owner' for clarity
      },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        // Use $first to convert the array from $lookup into a single object
        owner: { $first: "$owner" },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, "User tweets fetched successfully", tweets));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId, content } = req.body || req.params;
  if (!(tweetId && content)) {
    throw new ApiError(400, "tweetId and content are required");
  }
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweetId");
  }
  if (tweet.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You do not have permission to edit this tweet");
  }
  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { $set: { content } },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet updated successfully", tweet));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.body || req.params;
  if (!tweetId) {
    throw new ApiError(400, "tweetId is required");
  }
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweetId");
  }
  if (tweet.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You do not have permission to edit this tweet");
  }
  const deletedtweet = await Tweet.findByIdAndDelete(tweetId);
  const checktweetisdeleted = await Tweet.findById(tweetId);
  if (checktweetisdeleted) {
    throw new ApiError(500, "Failed to delete tweet");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet deleted successfully", deletedtweet));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
