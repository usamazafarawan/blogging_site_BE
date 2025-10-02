import { Schema, model } from 'mongoose';
import { ICategory, ICategoryModel, ISubCategory } from './categories.interface';


const SubCategorySchema = new Schema<ISubCategory>({
        name: { type: String, required: true }
});

const CategorySchema = new Schema<ICategory>({
        name: { type: String, required: true },
        subCategories: { type: [SubCategorySchema], default: [] }
});

export const Category: ICategoryModel = model<ICategory, ICategoryModel>(
        "Category",
        CategorySchema
);



