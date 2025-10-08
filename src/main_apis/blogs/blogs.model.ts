import { Schema, model } from 'mongoose';
import { IBlog, IBlogModel } from './blogs.interface';


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
    pdfPath: {
      type: String,
      required: true,
    },
    thumbnailPath: {
      type: String,
      required: true,
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



