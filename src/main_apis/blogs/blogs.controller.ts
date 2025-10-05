
import jwt from 'jsonwebtoken';
import * as jwtTokenKey from '../../app'
import bcrypt from 'bcryptjs'
import { Blogs } from './blogs.model';
import mongoose from "mongoose";



// Create categories from payload
export const createBlog = async (req , res ) => {
  try {
    const { name, description, author, moduleId } = req.body;
    const tags = req.body.tags ? JSON.parse(req.body.tags) : [];

    const pdfFile = (req.files as any)?.pdfFile?.[0];
    const thumbnail = (req.files as any)?.thumbnail?.[0];

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
      pdfPath: pdfFile.path,
      thumbnailPath: thumbnail.path,
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
export const getBlogs = async function (req,res)  {
  try {
    const blogs = await Blogs.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Blogs fetched successfully',
      data: blogs,
    });
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ message: 'Server error', error: err });
  }
};


