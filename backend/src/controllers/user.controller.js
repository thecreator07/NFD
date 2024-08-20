import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
// import { email_verification_mail } from "../utils/nodemailer.js";
// import { generateOtp } from "../constant.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/Cloudinary.js";
import twilio from "twilio"

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.AUTH_TOKEN
const client = new twilio(accountSid, authToken);
const generateAccesTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = await user.generateAccesToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("generateAccesTokenAndRefreshToken Error:", error);
        throw new ApiError(500, "Failed to generate tokens");
    }
};



const registerUser = asyncHandler(async (req, res) => {
    const { email, password, mobile } = req.body;

    // Check if any required fields are empty
    if ([mobile, email, password].some((field) => !field || field.trim() === "")) {
        throw new ApiError(401, "All fields are required");
    }

    // Check if user already exists with the same fullName or email
    const existingUser = await User.findOne({ $or: [{ mobile }, { email }] });
    if (existingUser) {
        throw new ApiError(409, "Email or mobile already in use");
    }


    // Create the user in the database
    const user = await User.create({
        ...req?.body
    });

    if (!user) {
        throw new ApiError(500, "Failed to create user");
    }

    // Return a response with created user details (excluding sensitive information)
    const responseUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(201).json(new ApiResponse(200, responseUser, "User registered successfully"));
});


// let otpStore = {};

// const SendEmail = asyncHandler(async (req, res) => {
//     const { mobile } = req.body;
//     console.log(mobile)
//     const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP

//     // Store OTP with expiration
//     otpStore[mobile] = { otp, expiresAt: Date.now() + 300000 }; // OTP valid for 5 minutes
//     console.log(otp)
//     client.messages.create({
//         body: `Your OTP is ${otp}`,
//         from: '+16592467435',
//         to: '+917762911512'
//     }).then(message => {

//         res.status(201).json(new ApiResponse(200, { message }, "Otp Send Successfully"))
//     }).catch(error => {
//         res.status(500).send('Error sending OTP');
//     });
// });

// const VerifyEmail = asyncHandler(async (req, res) => {
//     const { mobile, otp } = req.body;

//     const storedOtpData = otpStore[mobile];

//     if (!storedOtpData) {
//         return res.status(400).send('OTP not sent or expired');
//     }

//     if (storedOtpData.expiresAt < Date.now()) {
//         delete otpStore[mobile];
//         return res.status(400).send('OTP expired');
//     }

//     if (storedOtpData.otp === otp) {
//         delete otpStore[mobile];
//         const user = await User.create({
//             mobile
//         });
//         res.status(201).json(new ApiResponse(200, { user }, "user number verified successfully"))
//     } else {
//         res.status(400).send('Invalid OTP');
//     }
// })
const loginUser = asyncHandler(async (req, res) => {
    const { email, password, mobile } = req.body;

    // Validate email presence
    if (!email) {
        throw new ApiError(401, "Email is required");
    }

    // Find user by email
    const user = await User.findOne({ $or: [{ email }, { mobile }] });
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    // Validate password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Password is incorrect");
    }

    // Generate access token and refresh token
    const { accessToken, refreshToken } = await generateAccesTokenAndRefreshToken(user._id);

    // Remove sensitive data from user object
    const loggedInUser = await User.findByIdAndUpdate({ _id: user._id },
        { $set: { active: true } }, { new: true }
    ).select("-password -refreshToken");

    // Define cookie options based on environment
    const cookieOptions = {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "development" ? true : "none",
        secure: process.env.NODE_ENV !== "development", // Enable secure cookies in production
        // expires: new Date(Date.now() + process.env.COOKIE_EXPIRATION * 24 * 60 * 60 * 1000), // Example for setting expiration
    };

    // Set cookies and send JSON response
    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User successfully logged in"));
});


const logoutUser = asyncHandler(async (req, res) => {
    // Remove refreshToken from user document
    await User.findByIdAndUpdate(
        req.user._id,
        { $set: { active: false }, $unset: { refreshToken: 1 } },
        { new: true }
    );

    // Define cookie options based on environment
    const cookieOptions = {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "development" ? true : "none",
        secure: process.env.NODE_ENV !== "development", // Enable secure cookies in production
        // expires: new Date(Date.now() + process.env.COOKIE_EXPIRATION * 24 * 60 * 60 * 1000), // Example for setting expiration
    };

    // Clear cookies and send JSON response
    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body.refreshToken;

    console.log(req.cookies);
    if (!incomingRefreshToken) {
        throw new ApiError(401, "unathorized request");
    }
    try {
        const decodedRefreshToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedRefreshToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is expired");
        }

        const { accessToken, refreshToken } =
            await generateAccesTokenAndRefreshToken(user._id);
        // console.log(newRefreshtoken)
        const newRefreshtoken = refreshToken;
        return (
            res
                .status(200)
                // .clearCookie("refreshToken", options)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshtoken", newRefreshtoken, options)
                .json(
                    new ApiResponse(
                        200,
                        { accessToken, refreshToken: newRefreshtoken },
                        "accessToken refreshed successfully"
                    )
                )
        );
    } catch (error) {
        throw new ApiError(
            401,
            error?.message || "Something went wrong in Refreshing token"
        );
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id); //req.user is coming from auth.middleware
    console.log(oldPassword)
    const PasswordCorrect = await user.matchPassword(oldPassword);
    console.log(PasswordCorrect)
    if (!PasswordCorrect) {
        throw new ApiError(402, "Wrong Password !!");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(200, { newPassword }, "Password change Successfully")
        );
});

const currentuser = asyncHandler(async (req, res) => {

    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "tests", // Ensure this matches the collection name in your MongoDB
                localField: "_id",
                foreignField: "patient",
                as: "testDetails"
            }
        },
        {
            $unwind: {
                path: "$testDetails", // Optional: Use if you want to flatten the test details
                preserveNullAndEmptyArrays: true // Optional: Keeps patients without tests
            }
        },
        {
            $project: {
                _id: 1, // Include patient ID
                name: 1, // Include patient name (example field)
                description: 1, // Include patient description (example field)
                testDetails: {
                    testName: 1,
                    price: 1,
                    totalprice: 1 // Include other fields from the tests collection as needed
                }
            }
        }
    ]);



    return res
        .status(200)
        .json(new ApiResponse(201, user, "Current User Fetched Successfully"));
});

const updateUserDetails = asyncHandler(async (req, res) => {
    const { name, email, dob, gender, address } = req.body;


    const user = User.findById(req.user?._id)
    const oldAvatar = user?.avatar
    let avatarLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.avatar) &&
        req.files.avatar.length > 0
    ) {
        avatarLocalPath = req.files.avatar[0].path;
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    // const user = await User.findById(req.user?._id);
    // user.username = username;
    // user.email = email;
    // user.avatar = avatar?.url || "";
    // await user.save({ validateBeforeSave: false });
    // const updatedUser = await User.findById(req.user?._id);
    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                dob: dob || null,
                name: name || user.name,
                email: email || user.email,
                avatar: avatar?.url || "",
                gender: gender || "",
                address: address || ""
            },
        },
        { new: true }
    ).select("-password");

    await deleteFromCloudinary(oldAvatar)

    return res
        .status(200)
        .json(new ApiResponse(200, { updatedUser }, "User updated successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarlocalPath = req.file?.path;
    if (!avatarlocalPath) {
        throw new ApiError(400, "avatar file missing");
    }

    const avatar = await uploadOnCloudinary(avatarlocalPath);

    if (!avatar.url) {
        throw new ApiError(400, "Error while updating Avatar of user");
    }

    const oldAvatar = req.user?.avatar;
    console.log("oldavatar has found", oldAvatar);
    if (!oldAvatar) {
        throw new ApiError(400, "Old Avatar file fetch Unsuccessful");
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url || "",
            },
        },
        { new: true }
    ).select("-password");

    await deleteFromCloudinary(oldAvatar);

    return res
        .status(200)
        .json(
            new ApiResponse(200, { updatedUser }, "User Avatar updated successfully")
        );
});


export { registerUser, loginUser, logoutUser, changeCurrentPassword, currentuser, updateUserDetails, updateAvatar, refreshAccessToken };
