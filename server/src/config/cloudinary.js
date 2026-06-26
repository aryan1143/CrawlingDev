import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadToCloudinary = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      },
    );

    uploadStream.end(fileBuffer);
  });
};

const deleteFromCloudinary = async (imageUrl) => {
  try {
    const urlParts = imageUrl.split("/");
    const uploadIndex = urlParts.indexOf("upload");

    const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join("/");
    const publicId = publicIdWithExtension.split(".")[0];

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error("Failed to delete asset from Cloudinary: " + error.message);
  }
};

const deleteFolderEntirelyFromCloudinary = async (folderPath) => {
  try {
    const prefix = folderPath.endsWith("/") ? folderPath : `${folderPath}/`;

    const cleanFolderPath = folderPath.endsWith("/")
      ? folderPath.slice(0, -1)
      : folderPath;

    const resourceTypes = ["image", "video", "raw"];

    await Promise.all(
      resourceTypes.map((type) =>
        cloudinary.api.delete_resources_by_prefix(prefix, {
          resource_type: type,
          invalidate: true,
        }),
      ),
    );

    const folderDeleteResult =
      await cloudinary.api.delete_folder(cleanFolderPath);

    return folderDeleteResult;
  } catch (error) {
    console.error("Failed to completely remove folder:", error);
  }
};

export {
  upload,
  uploadToCloudinary,
  deleteFromCloudinary,
  deleteFolderEntirelyFromCloudinary,
};
