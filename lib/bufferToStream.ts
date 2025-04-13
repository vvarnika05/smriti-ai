import { Readable } from "stream";
import cloudinary from "@/lib/cloudinary"; // adjust the path as needed

function bufferToStream(buffer: Buffer) {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

export async function uploadPDFBuffer(buffer: Buffer, filename: string) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        public_id: filename, // optional: name without extension
        format: "pdf", // optional
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    bufferToStream(buffer).pipe(uploadStream);
  });
}
