import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uoloadcloudnary = async (filepath) => {
  try {
    if (!localpath) return null;
    const responce = await cloudinary.uploader.upload(filepath, {
      resource_type: "auto",
    });
    console.log(
      "File uploaded successfully to Cloudinary the responce ",
      responce.url
    );
    return responce;
  } catch (error) {
    fs.unlinkSync(filepath);
    console.log("Error while uploading file to cloudinary ", error);
  }
};
