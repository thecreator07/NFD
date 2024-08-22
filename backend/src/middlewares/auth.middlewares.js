import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";


export const verifyJwt = asyncHandler(async (req, _, next) => {
    try {
        //find accessToken from header or cookies
        console.log("cookies", req.cookies)
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        // console.log(token)
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }
        // let token = req.header("Authorization");
        // if (!token) {
        //     return res.status(401).send("Access Denied");
        // }
        // if (token.startsWith("Bearer ")) {
        //     token = token.slice(7, token.length).trimLeft();
        // }

        // console.log(token);
        // to make sure user is Valid, we verify token with our ACCESS_TOKEN_SECRET it will give payload from jwt.sign(from generateAccesToken() methods )
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // console.log(decodedToken);

        // here we are accessing and Updating user from DataBase
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );
        // console.log(user);
        if (!user) {
            throw new ApiError(401, "invalid user accessToken");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid data accessToken");
    }
});


export const verifyAdmin = (req, res, next) => {
    const user = req.user;

    if (!user || user.role !== 'admin') {
        throw new ApiError(403, 'Unauthorized access - Admin role required');
    }

    next();
};
export const verifyDoctor = (req, res, next) => {
    const user = req.user;

    if (!user || user.role !== 'doctor') {
        throw new ApiError(403, 'Unauthorized access - doctor role required');
    }

    next();
};