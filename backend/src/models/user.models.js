import Mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    dob: {
        type: Date,
        default: null,
    },
    // test: {
    //     type: Schema.Types.ObjectId,
    //     ref: "Test"
    // },
    mobile: {
        type: String
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        default: "Male",
    },
    address: {
        type: String,
        default: ""
        // required: true
    },
    avatar: {
        type: String,
        default: null,
    },
    refreshToken: {
        type: String,
    },
    role: {
        type: String,
        enum: ['patient', 'doctor', 'technician', 'admin'],
        default: 'patient',
    },
    otp: {
        type: Number
    },
    otpExpire: {
        type: Date
    },
    emailVerified: {
        type: Boolean,
        default: false,
    }, active: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// Password hashing middleware
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});
// Password match method
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

//this method will return token which can be used to authenticate user
UserSchema.methods.generateAccesToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,

        },
        // {algorithm:'HS256'}
    );
};

UserSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

export const User = Mongoose.model("User", UserSchema);

