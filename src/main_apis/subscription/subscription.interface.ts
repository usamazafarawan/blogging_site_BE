import { Schema, Document, Model, model } from "mongoose";


export interface ISubscription extends Document {
  email: string;
}

// Optional if you want static methods later
export interface ISubscriptionModel extends Model<ISubscription> {}

