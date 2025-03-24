import { v2 as cloudinary } from "cloudinary";
import { writeReadableStreamToWritable } from "@react-router/node";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true
});

export default cloudinary;

export async function uploadImage(
  data: ReadableStream<Uint8Array>,
  folder: "avatars" | "susurros" | "products",
  publicId: string | undefined = undefined,
  transformation: Record<string, number> | undefined = undefined
): Promise<any> {
  const uploadPromise = new Promise(async (resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        transformation: [
          { quality: "auto:good" },
          { fetch_format: "auto" },
          { width: 800, crop: "scale" },
          { secure: true },
          transformation
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      }
    );
    await writeReadableStreamToWritable(data, uploadStream);
  });
  return uploadPromise;
}
