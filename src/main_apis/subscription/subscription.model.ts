import { Schema, model } from 'mongoose';
import { ISubscription, ISubscriptionModel } from './subscription.interface';




const SubscriptionSchema = new Schema<ISubscription>({
        email: {
                type: String,
                required: true,
                unique: true,
                lowercase: true,
                trim: true,
        },
}, {
        timestamps: true,
});

export const Subscriptions: ISubscriptionModel = model<ISubscription, ISubscriptionModel>(
        "SubscriptionEmails",
        SubscriptionSchema
);



