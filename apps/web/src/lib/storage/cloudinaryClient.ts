import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadImageBuffer(buffer: Buffer, folder: string = 'chainproof'): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        if (result) return resolve(result.secure_url);
        reject(new Error('Unknown upload error'));
      }
    );
    uploadStream.end(buffer);
  });
}

/** Uploads a non-image file (e.g. a generated PDF report) and returns its secure URL. */
export async function uploadFileBuffer(buffer: Buffer, folder: string = 'chainproof/reports'): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'raw', format: 'pdf' },
      (error, result) => {
        if (error) return reject(error);
        if (result) return resolve(result.secure_url);
        reject(new Error('Unknown upload error'));
      }
    );
    uploadStream.end(buffer);
  });
}
