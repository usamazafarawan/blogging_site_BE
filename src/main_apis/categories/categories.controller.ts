
import jwt from 'jsonwebtoken';
import * as jwtTokenKey from '../../app'
import bcrypt from 'bcryptjs'
import { Category } from './categories.model';



// Create categories from payload
export const createCategories = async function (req,res)  {
  try {
    const { categories } = req.body;

    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({ message: "Invalid payload format" });
    }

    // Clean DB (optional: if you want to replace all categories)
    await Category.deleteMany({});

    // Insert new categories
    const inserted = await Category.insertMany(categories);

    return res.status(201).json({
      message: "Categories saved successfully",
      data: inserted
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


