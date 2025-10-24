import mongoose, { Schema, Document, Model, model,Types  } from "mongoose";



export interface IBlog extends Document {
  name: string;
  description: string;
  author: string;
  moduleId: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  moduleDetail: {
    id: string;          // or ObjectId if you're using MongoDB
    name: string;
  };
  pdfFileId?: Types.ObjectId;         // Reference to fs.files
  pdfUrl?: string;  // URL to access the PDF file
  thumbnailFileId?: Types.ObjectId;         // Reference to fs.files
  thumbnailUrl?: string;  // URL to access the thumbnail image
}

// Optional if you want static methods later
export interface IBlogModel extends Model<IBlog> {}

