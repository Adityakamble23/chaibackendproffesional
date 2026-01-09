import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
  if (userId && !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }
  const filter = {};
  if (query) {
    filter.title = { $regex: query, $options: "i" };
  }
  if (userId) {
    filter.owner = userId;
  }
  filter.isPublished = true;
  const skip = (Number(page) - 1) * Number(limit);
  const limitNum = Number(limit);
  const videos = await Video.find(filter)
    .sort({ [sortBy]: sortType === "asc" ? 1 : -1 })
    .skip(skip)
    .limit(limitNum);
  // Also get the total count so the frontend knows how many pages there are
  const totalVideos = await Video.countDocuments(filter);
  return res.status(200).json(
    new ApiResponse(200, {
      videos,
      pagination: {
        total: totalVideos,
        page: Number(page),
        limit: limitNum,
        totalPages: Math.ceil(totalVideos / limitNum),
      },
    })
  );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(
      401,
      "Title or Description is required to publish a video"
    );
  }

  const thumbnailfile = req.files?.thumbnail?.[0].path;
  const videofile = req.files?.videoFile?.[0].path;
  console.log(
    "this is the video file and thumbnail file ",
    videofile,
    thumbnailfile
  );
  if (!videofile) {
    throw new ApiError(400, "Video file is required");
  }
  if (!thumbnailfile) {
    throw new ApiError(400, "Thumbnail file is required");
  }
  //   const uploadedVideo = await uploadOnCloudinary(videofile);
  //   const uploadedThumbnail = await uploadOnCloudinary(thumbnailfile);

  const [uploadedVideo, uploadedThumbnail] = await Promise.all([
    uploadOnCloudinary(videofile),
    uploadOnCloudinary(thumbnailfile),
  ]);

  if (!uploadedVideo) {
    throw new ApiError(500, "Error in uploading video");
  }
  if (!uploadedThumbnail) {
    throw new ApiError(500, "Error in uploading thumbnail");
  }

  const video = await Video.create({
    videoFile: uploadedVideo.url,
    thumbnail: uploadedThumbnail.url,
    title,
    description,
    duration: uploadedVideo.duration,
    owner: req.user._id,
  });
  const createvideo = await Video.findById(video._id);

  if (!createvideo) {
    throw new ApiError(500, "Something went wrong while registering the video");
  }
  console.log("this is owner of video", req.user._id);
  return res
    .status(201)
    .json(new ApiResponse(201, createvideo, "Video published successfully"));
  // TODO: get video, upload to cloudinary, create video
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Video fetched successfully", video));

  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const { title, description } = req.body;
  const thumbnailfile = req.files?.thumbnail?.[0]?.path;

  if (!(title || description || thumbnailfile)) {
    throw new ApiError(400, "At least one field is required to update");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Build update object dynamically
  const updateFields = {};
  if (title) updateFields.title = title;
  if (description) updateFields.description = description;

  if (thumbnailfile) {
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailfile);
    if (!uploadedThumbnail) {
      throw new ApiError(500, "Error in uploading thumbnail");
    }
    updateFields.thumbnail = uploadedThumbnail.url;
  }

  const updateddetails = await Video.findByIdAndUpdate(
    videoId,
    { $set: updateFields },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Video updated successfully", updateddetails));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  await Video.findByIdAndDelete(videoId);
  return res
    .status(200)
    .json(new ApiResponse(200, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  video.isPublished = !video.isPublished;
  await video.save();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        `Video ${video.isPublished ? "published" : "unpublished"} successfully`,
        video
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
