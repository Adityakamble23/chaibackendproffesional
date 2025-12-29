import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uoloadcloudnary = async (filepath) => {
  // Configure cloudinary here to ensure env vars are loaded
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    if (!filepath) return null;
    const responce = await cloudinary.uploader.upload(filepath, {
      resource_type: "auto",
    });
    console.log(
      "File uploaded successfully to Cloudinary the responce ",
      responce.url
    );
    fs.unlinkSync(filepath); // Remove local file after successful upload
    return responce;
  } catch (error) {
    if (filepath && fs.existsSync(filepath)) {
      fs.unlinkSync(filepath); // Remove local file if upload fails
    }
    console.log("Error while uploading file to cloudinary ", error);
    return null;
  }
};
export { uoloadcloudnary };
