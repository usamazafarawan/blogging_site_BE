
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
    const { name, description, author, moduleId, pdfFile, thumbnail, moduleDetail } = req.body;
    const tags = req.body.tags ? req.body.tags : [];

    if (!pdfFile || !thumbnail) {
      return res.status(400).json({ message: 'Missing PDF or thumbnail file' });
    }

    let pdfFileId = null;
    let thumbnailFileId = null;

    if (pdfFile) {
      pdfFileId = await uploadToGridFS(pdfFile, `${Date.now()}_file.pdf`, "application/pdf");
    }

    if (thumbnail) {
      thumbnailFileId = await uploadToGridFS(thumbnail, `${Date.now()}_image.png`, "image/png");
    }

    // ✅ Create and save to MongoDB
    const blog = new Blogs({
      name,
      description,
      author,
      moduleId,
      tags,
      moduleDetail,
      pdfFileId,
      thumbnailFileId,
    });

    if (pdfFileId) {
      blog.pdfUrl = `${environment.apiUrl}/blogs/pdf/${blog._id}`;
    }

    if (thumbnailFileId) {
      blog.thumbnailUrl = `${environment.apiUrl}/blogs/img/${blog._id}`;
    }

    await blog.save();

    res.status(201).json({
      message: 'Blog created successfully!',
      data: blog,
    });
  } catch (err) {
    console.error('Error creating blog:', err);
    res.status(500).json({ message: 'Server error', error: err });
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
    const { name, description, author, moduleId, pdfFile, thumbnail, moduleDetail, tags = [] } = req.body;

    // ✅ Find existing blog
    const existingBlog = await Blogs.findById(blogId);
    if (!existingBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // ✅ Update only provided fields
    if (name) existingBlog.name = name;
    if (description) existingBlog.description = description;
    if (author) existingBlog.author = author;
    if (moduleId) existingBlog.moduleId = moduleId;
    if (tags.length) existingBlog.tags = tags;
    if (moduleDetail) existingBlog.moduleDetail = moduleDetail;



    let pdfFileId = null;
    let thumbnailFileId = null;

    if (pdfFile) {
      pdfFileId = await uploadToGridFS(pdfFile, `${Date.now()}_file.pdf`, "application/pdf");
      if (pdfFileId) {
        await gfsBucket.delete(new mongoose.Types.ObjectId(existingBlog.pdfFileId)); // remove old file
        existingBlog.pdfFileId = pdfFileId;
        existingBlog.pdfUrl = `${environment.apiUrl}/blogs/pdf/${blogId}`;
      }
    }

    if (thumbnail) {
      thumbnailFileId = await uploadToGridFS(thumbnail, `${Date.now()}_image.png`, "image/png");
      if (thumbnailFileId) {
        await gfsBucket.delete(new mongoose.Types.ObjectId(existingBlog.thumbnailFileId)); // remove old file
        existingBlog.thumbnailFileId = thumbnailFileId;
        existingBlog.thumbnailUrl = `${environment.apiUrl}/blogs/img/${blogId}`;
      }
    }

    // ✅ Save changes
    await existingBlog.save();

    res.status(200).json({
      message: 'Blog updated successfully!',
      data: existingBlog,
    });
  } catch (err) {
    console.error('Error updating blog:', err);
    res.status(500).json({ message: 'Server error', error: err });
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


  // Helper to write base64 -> GridFS and return fileId
const uploadToGridFS = (base64Data, filename, contentType) => {
  return new Promise((resolve, reject) => {
    try {
      // Remove base64 prefix if present
      const base64Clean = base64Data.replace(/^data:.*;base64,/, "");

      // Convert to binary
      const buffer = Buffer.from(base64Clean, "base64");

      // Create stream
      const readStream = new Readable();
      readStream.push(buffer);
      readStream.push(null);

      // Upload to GridFS
      const uploadStream = gfsBucket.openUploadStream(filename, { contentType });

      readStream.pipe(uploadStream)
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





