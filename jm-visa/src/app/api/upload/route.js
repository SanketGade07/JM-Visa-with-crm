import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

export const config = {
  api: {
    bodyParser: false, // Disable Next.js default body parser
  },
};

export async function POST(req) {
  try {
    // Convert the request into an ArrayBuffer, then to a Node Readable stream
    const buffer = await req.arrayBuffer();
    const stream = Readable.from(new Uint8Array(buffer));

    // Convert Next.js Headers instance to a plain object
    const headers = Object.fromEntries(req.headers.entries());

    // Create a new IncomingForm instance and assign the headers
    const form = new IncomingForm({ multiples: false });
    form.headers = headers;

    return new Promise((resolve, reject) => {
      form.parse(stream, (err, fields, files) => {
        if (err) {
          console.error("Formidable parsing error:", err);
          return reject(
            new Response(JSON.stringify({ error: "File upload failed!" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            })
          );
        }

        const file = files.file;
        if (!file) {
          return resolve(
            new Response(JSON.stringify({ error: "No file uploaded!" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            })
          );
        }

        // Ensure the upload directory exists
        const uploadDir = path.join(process.cwd(), "public/uploads");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, file.originalFilename);
        // Read the temporary file and write it to our upload folder
        const fileData = fs.readFileSync(file.filepath);
        fs.writeFileSync(filePath, fileData);
        fs.unlinkSync(file.filepath); // Delete the temporary file

        resolve(
          new Response(
            JSON.stringify({
              success: true,
              message: "File uploaded successfully!",
              fileUrl: `/uploads/${file.originalFilename}`,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          )
        );
      });
    });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
