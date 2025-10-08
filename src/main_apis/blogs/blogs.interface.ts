import mongoose, { Schema, Document, Model, model } from "mongoose";



export interface IBlog extends Document {
  name: string;
  description: string;
  author: string;
  moduleId: string; 
  tags: string[];
  pdfPath: string;
  thumbnailPath: string;
  createdAt: Date;
  updatedAt: Date;
    moduleDetail: {
    id: string;          // or ObjectId if you're using MongoDB
    name: string;
  };
}

// Optional if you want static methods later
export interface IBlogModel extends Model<IBlog> {}

