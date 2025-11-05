
import jwt from 'jsonwebtoken';
import * as jwtTokenKey from '../../app'
import bcrypt from 'bcryptjs'
import { Subscriptions } from './subscription.model';
import mongoose from "mongoose";


// Create categories from payload
export const addSubscriptionMail = async function (req, res) {
  try {
    const { email } = req.body;

     if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if already exists
    const existing = await Subscriptions.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already subscribed" });
    }

    // Save to DB
    const newEmail = await Subscriptions.create({ email });

    return res.status(201).json({
      message: "Email subscribed successfully",
      data: newEmail,
    });

  } catch (error) {
    console.error("Error saving categories:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all categories
export const getSubscriptionMailList = async function (req,res)  {
  try {
    const subscriptionEmailList = await Subscriptions.find().sort({ createdAt: -1 });
    return res.status(200).json({ data: subscriptionEmailList, message: "Subscription Email List Fetched Successfully" });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


