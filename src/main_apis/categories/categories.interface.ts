import { Schema, Document, Model, model } from "mongoose";

export interface ISubCategory {
  name: string;
}

export interface ICategory extends Document {
  name: string;
  subCategories: ISubCategory[];
}

// Optional if you want static methods later
export interface ICategoryModel extends Model<ICategory> {}

