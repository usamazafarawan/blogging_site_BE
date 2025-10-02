import { Schema, model } from 'mongoose';
import { ISignUp } from './signUp.interface';


let signUpSchema: Schema<ISignUp> = new Schema({

        name: { type: String, required: true },
        password: { type: String, required: true},
        email: { type: String, required: true},
        role: { type: String, required: true},

    
});

//@ts-ignore
export = model<ISignUp, ISignUpModel>('users', signUpSchema);


