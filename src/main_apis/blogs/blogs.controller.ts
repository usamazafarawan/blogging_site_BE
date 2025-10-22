
import jwt from 'jsonwebtoken';
import * as jwtTokenKey from '../../app'
import bcrypt from 'bcryptjs'
import { Blogs } from './blogs.model';
import mongoose from "mongoose";



// Create categories from payload
export const createBlog = async (req, res) => {
  try {
    const { name, description, author, moduleId, pdfFile, thumbnail, moduleDetail } = req.body;
    console.log('moduleId: ', moduleId);
    console.log('author: ', author);
    console.log('description: ', description);
    console.log('name: ', name);
    const tags = req.body.tags ? req.body.tags : [];
    console.log('tags: ', tags);

    // const pdfFile = (req.files as any)?.pdfFile?.[0];
    // console.log('pdfFile: ', pdfFile);
    // const thumbnail = (req.files as any)?.thumbnail?.[0];
    // console.log('thumbnail: ', thumbnail);

    // ✅ Validation
    if (!pdfFile || !thumbnail) {
      return res.status(400).json({ message: 'Missing PDF or thumbnail file' });
    }

    // ✅ Create and save to MongoDB
    const blog = new Blogs({
      name,
      description,
      author,
      moduleId,
      tags,
      pdfPath: pdfFile,
      thumbnailPath: thumbnail,
      moduleDetail
    });

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
    console.log('categoryId: ', categoryId);
    const blogs = await Blogs.find({ "moduleDetail.id": categoryId })
      .sort({ createdAt: -1 })
      .select("name description author createdAt moduleDetail thumbnailPath _id") // ✅ only these fields
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
    console.log('blogId: ', blogId);
    const deletedBlog = await Blogs.findByIdAndDelete(blogId);

    if (!deletedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
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

    // ✅ Update files only if new ones provided
    if (pdfFile) existingBlog.pdfPath = pdfFile;
    if (thumbnail) existingBlog.thumbnailPath = thumbnail;

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





