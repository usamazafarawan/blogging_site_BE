
import jwt from 'jsonwebtoken';
import * as jwtTokenKey from '../../app'
import bcrypt from 'bcryptjs'
import { Category } from './categories.model';
import mongoose from "mongoose";


// Create categories from payload
export const createCategories = async function (req, res) {
  try {
    const { categories } = req.body;

    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({ message: "Invalid payload format" });
    }

    // Fetch existing categories from DB
    const existingCategories = await Category.find({});

    // Create a map of existing categories by name for quick lookup
    const categoryMap = new Map();
    for (const cat of existingCategories) {
      categoryMap.set(cat.name, cat);
    }

    const finalCategories = [];

    for (const category of categories) {
      let categoryDoc = categoryMap.get(category.name);

      if (categoryDoc) {
        // Category already exists → reuse ID
        const existingSubMap:any = new Map(
          categoryDoc.subCategories.map((s) => [s.name, s])
        );

        const updatedSubCategories:any = category.subCategories.map((sub) => {
          if (existingSubMap.has(sub.name)) {
            // Reuse existing subcategory ID
            return {
              ...sub,
              _id: existingSubMap.get(sub.name)._id,
            };
          } else {
            // New subcategory → generate new _id
            return {
              ...sub,
              _id: new mongoose.Types.ObjectId(),
            };
          }
        });

        categoryDoc.name = category.name;
        categoryDoc.subCategories = updatedSubCategories;
        await categoryDoc.save();
        finalCategories.push(categoryDoc);
      } else {
        // New category → assign new IDs to category & subcategories
        const newCategory = new Category({
          name: category.name,
          subCategories: category.subCategories.map((sub) => ({
            ...sub,
            _id: new mongoose.Types.ObjectId(),
          })),
        });

        await newCategory.save();
        finalCategories.push(newCategory);
      }
    }

    return res.status(201).json({
      message: "Categories saved successfully",
      data: finalCategories,
    });
  } catch (error) {
    console.error("Error saving categories:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all categories
export const getCategories = async function (req,res)  {
  try {
    const cats = await Category.find();
    return res.status(200).json(cats);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


