import { Schema, model } from 'mongoose';
import { IBlog, IBlogModel } from './blogs.interface';
import mongoose from "mongoose";


/**
 * 2️⃣ Define the Mongoose schema
 */
const BlogSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    moduleId: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    pdfFileId: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' },
    pdfUrl: {
      type: String,
    },
    thumbnailFileId: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' },
    thumbnailUrl: {
      type: String,
    },
      moduleDetail: {
      id: {
        type: String, 
        required: false,
      },
      name: {
        type: String,
        required: false,
      },
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

/**
 * 3️⃣ Export the model
 */

export const Blogs: IBlogModel = model<IBlog, IBlogModel>(
        "Blogs",
        BlogSchema
);



