
import jwt from 'jsonwebtoken';
import * as jwtTokenKey from '../../app'
import bcrypt from 'bcryptjs'
import { Blogs } from './blogs.model';
import mongoose from "mongoose";
import { Readable } from "stream";
import { gfsBucket } from "../../app";
import { environment } from "../../app";




// Create categories from payload
export const createBlog = async (req, res) => {
  try {
    const { name, description, author, moduleId, tags, moduleDetail } = req.body;

    // Parse JSON fields (since FormData sends everything as strings)
    const parsedTags = tags ? JSON.parse(tags) : [];
    const parsedModuleDetail = moduleDetail ? JSON.parse(moduleDetail) : {};

   let pdfFileId = null;
let thumbnailFileId = null;

// ✅ Handle PDF upload (if provided)
if (req.files?.pdfFile?.[0]) {
  const pdfFile = req.files.pdfFile[0];
  pdfFileId = await uploadToGridFS(
    pdfFile.buffer,
    `${Date.now()}_${pdfFile.originalname}`,
    pdfFile.mimetype || "application/pdf"
  );
}

// ✅ Handle Thumbnail upload (if provided)
if (req.files?.thumbnail?.[0]) {
  const thumbFile = req.files.thumbnail[0];
  thumbnailFileId = await uploadToGridFS(
    thumbFile.buffer,
    `${Date.now()}_${thumbFile.originalname}`,
    thumbFile.mimetype || "image/png"
  );
}

    // ✅ Create blog entry in MongoDB
    const blog = new Blogs({
      name,
      description,
      author,
      moduleId,
      tags: parsedTags,
      moduleDetail: parsedModuleDetail,
      pdfFileId,
      thumbnailFileId,
    });

    await blog.save();

    // ✅ Generate file URLs
    if (pdfFileId) {
      blog.pdfUrl = `${environment.apiUrl}/api/blogs/pdf/${blog._id}`;
    }
    if (thumbnailFileId) {
      blog.thumbnailUrl = `${environment.apiUrl}/api/blogs/img/${blog._id}`;
    }

    // ✅ Save again with URLs
    await blog.save();

    res.status(201).json({
      message: "✅ Blog created successfully!",
      data: blog,
    });
  } catch (err) {
    console.error("❌ Error creating blog:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all categories
export const getBlogs = async function (req, res) {
  try {
    const blogs = await Blogs.find()
      .sort({ createdAt: -1 })
      .allowDiskUse(true);

    res.status(200).json({
      message: 'Blogs fetched successfully',
      data: blogs,
    });
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Get all categories
export const getBlogsByCategory = async function (req, res) {
  try {
    const categoryId = req.params.id; // <-- get ID from route
    const blogs = await Blogs.find({ "moduleDetail.id": categoryId })
      .sort({ createdAt: -1 })
      .select("name description author createdAt moduleDetail thumbnailUrl _id") // ✅ only these fields
      .allowDiskUse(true);

    res.status(200).json({
      message: 'Blogs fetched successfully',
      data: blogs,
    });
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
};


export const getBlogById = async function (req, res) {
  try {
    const blogId = req.params.id; 
    const isEdit = req.query.isEdit === 'true';
    const fieldsToSelect = isEdit ? 'author description moduleDetail name tags _id': '';
    const blogs = await Blogs.findById(blogId)
      .sort({ createdAt: -1 })
      .select(fieldsToSelect) 
      .allowDiskUse(true);

    res.status(200).json({
      message: 'Blog Detail fetched successfully',
      data: blogs,
    });
  } catch (err) {
    console.error('Error fetching blog:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const deleteBlogById = async function (req, res) {
  try {
    const blogId = req.params.id; // <-- get ID from route
    const deletedBlog = await Blogs.findByIdAndDelete(blogId);

    if (!deletedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    try {
      await gfsBucket.delete(new mongoose.Types.ObjectId(deletedBlog.pdfFileId));
      await gfsBucket.delete(new mongoose.Types.ObjectId(deletedBlog.thumbnailFileId));
      console.log("✅ File deleted from GridFS successfully");
    } catch (err) {
      console.error("❌ Error deleting file from GridFS:", err);
    }

    res.status(200).json({
      message: 'Blog deleted successfully',
      data: deletedBlog,
    });

  } catch (err) {
    console.error('Error fetching blog:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const updateBlogById = async (req, res) => {
  try {
    const blogId = req.params.id;
    const { name, description, author, moduleId, tags, moduleDetail } = req.body;

    const parsedTags = tags ? JSON.parse(tags) : [];
    const parsedModuleDetail = moduleDetail ? JSON.parse(moduleDetail) : {};

    // ✅ Find the existing blog
    const existingBlog = await Blogs.findById(blogId);
    if (!existingBlog) {
      return res.status(404).json({ message: "❌ Blog not found" });
    }

    // ✅ Update basic fields if provided
    if (name) existingBlog.name = name;
    if (description) existingBlog.description = description;
    if (author) existingBlog.author = author;
    if (moduleId) existingBlog.moduleId = moduleId;
    if (parsedTags.length) existingBlog.tags = parsedTags;
    if (parsedModuleDetail) existingBlog.moduleDetail = parsedModuleDetail;

    let pdfFileId = null;
    let thumbnailFileId = null;

    // ✅ Handle PDF upload (if provided)
    if (req.files?.pdfFile?.[0]) {
      const pdfFile = req.files.pdfFile[0];
      pdfFileId = await uploadToGridFS(
        pdfFile.buffer,
        `${Date.now()}_${pdfFile.originalname}`,
        pdfFile.mimetype || "application/pdf"
      );

      if (pdfFileId) {
        await gfsBucket.delete(new mongoose.Types.ObjectId(existingBlog.pdfFileId)); // remove old file
        existingBlog.pdfFileId = pdfFileId;
        existingBlog.pdfUrl = `${environment.apiUrl}/api/blogs/pdf/${blogId}`;
      }
    }

    // ✅ Handle Thumbnail upload (if provided)
    if (req.files?.thumbnail?.[0]) {
      const thumbFile = req.files.thumbnail[0];
      thumbnailFileId = await uploadToGridFS(
        thumbFile.buffer,
        `${Date.now()}_${thumbFile.originalname}`,
        thumbFile.mimetype || "image/png"
      );

      if (thumbnailFileId) {
        await gfsBucket.delete(new mongoose.Types.ObjectId(existingBlog.thumbnailFileId));
        existingBlog.thumbnailFileId = thumbnailFileId;
        existingBlog.thumbnailUrl = `${environment.apiUrl}/api/blogs/img/${blogId}`;
      }
    }

    // ✅ Save changes
    await existingBlog.save();

    res.status(200).json({
      message: "✅ Blog updated successfully!",
      data: existingBlog,
    });
  } catch (err) {
    console.error("❌ Error updating blog:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};




export const getPdfByBlogId = async (req, res) => {
  try {
    const blog = await Blogs.findById(req.params.id);
    if (!blog || !blog.pdfFileId) {
      return res.status(404).send("❌ Blog or PDF not found");
    }

    const fileId = new mongoose.Types.ObjectId(blog.pdfFileId);

    const files = await gfsBucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).send("File not found in GridFS");
    }

    const file = files[0];

    res.setHeader("Content-Type", file.contentType || "application/pdf");
    res.setHeader("Content-Length", file.length);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${file.filename || "file.pdf"}"`
    );
    res.setHeader("Access-Control-Allow-Origin", "*");


    const downloadStream = gfsBucket.openDownloadStream(fileId);
    downloadStream.pipe(res);

    downloadStream.on("error", (err) => {
      console.error("Stream error:", err);
      res.status(500).end();
    });

    downloadStream.on("end", () => {
      console.log("✅ Stream finished");
      res.end();
    });
  } catch (err) {
    console.error("Error retrieving PDF:", err);
    res.status(500).send("Server error");
  }
}

export const getImageByBlogId = async (req, res) => {
  try {
    const blog = await Blogs.findById(req.params.id);
    if (!blog || !blog.thumbnailFileId) {
      return res.status(404).send("❌ Blog or image not found");
    }

    const fileId = new mongoose.Types.ObjectId(blog.thumbnailFileId);

    const files = await gfsBucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).send("❌ Image not found in GridFS");
    }

    const file = files[0];
    console.log('📦 Image file details:', file.filename, file.contentType, file.length);

    // ✅ Set appropriate headers for the browser
    res.setHeader("Content-Type", file.contentType || "image/png");
    res.setHeader("Content-Length", file.length);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${file.filename || "image.png"}"`
    );
    res.setHeader("Access-Control-Allow-Origin", "*");

    // ✅ Stream the image
    const downloadStream = gfsBucket.openDownloadStream(fileId);
    downloadStream.pipe(res);

    downloadStream.on("error", (err) => {
      console.error("❌ Stream error:", err);
      res.status(500).end();
    });

    downloadStream.on("end", () => {
      console.log("✅ Image stream finished");
      res.end();
    });

  } catch (err) {
    console.error("❌ Error retrieving image:", err);
    res.status(500).send("Server error");
  }
};


/**
 * Uploads a file buffer to MongoDB GridFS and returns the fileId.
 * @param {Buffer} buffer - The file buffer (e.g. req.file.buffer)
 * @param {string} filename - The filename to store in GridFS
 * @param {string} contentType - The MIME type (e.g. 'application/pdf' or 'image/png')
 * @returns {Promise<ObjectId>} The uploaded file's ObjectId
 */
export const uploadToGridFS = (buffer, filename, contentType) => {
  return new Promise<void | mongoose.Types.ObjectId>((resolve, reject) => {
    try {
      // ✅ Create a readable stream from the file buffer
      const readStream = Readable.from(buffer);

      // ✅ Open a GridFS upload stream
      const uploadStream = gfsBucket.openUploadStream(filename, { contentType });

      // ✅ Pipe the buffer into GridFS
      readStream
        .pipe(uploadStream)
        .on("finish", () => {
          console.log(`✅ File uploaded (${contentType}):`, uploadStream.id);
          resolve(uploadStream.id);
        })
        .on("error", (err) => {
          console.error("❌ Error uploading to GridFS:", err);
          reject(err);
        });

    } catch (err) {
      reject(err);
    }
  });
};




