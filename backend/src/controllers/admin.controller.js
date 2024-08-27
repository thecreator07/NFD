import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/Cloudinary.js";
import { Test } from "../models/test.models.js";
const SearchUserData = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const { fullName, mobile, role } = req.body;

        // Initialize the query object
        let searchQuery = {};

        // Add individual field filters
        if (fullName && fullName.trim() !== "") {
            searchQuery.fullName = { $regex: fullName, $options: "i" }; // case-insensitive search
        }

        if (mobile && mobile.trim() !== "") {
            searchQuery.mobile = { $regex: mobile, $options: "i" };
        }

        if (role && role.trim() !== "") {
            searchQuery.role = role;
        }

        // Perform the search query with pagination
        const result = await User.find(searchQuery)
            // .select('-_id') // Exclude _id from the result if you want
            .skip((page - 1) * limit)
            .limit(limit).sort()
            .exec();

        return res.status(200).json(new ApiResponse(200, { result }, "User Data Fetched Successfully"));
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: "failed",
            message: "Server error",
        });
    }
});


const UserUpdate = asyncHandler(async (req, res) => {
    try {
        const { role } = req.body
        const { doctorId } = req.params;

        if (!role) {
            throw new ApiError(400, "input the role")
        }

        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            throw new ApiError(400, "Invalid ObjectId");
        }

        const doctor = await User.findById(doctorId)
        if (!doctor) {
            throw new ApiError(500, "User Doesn't Exist")
        }

        const updateUser = await User.findByIdAndUpdate(doctor._id, { $set: { role } }, { new: true })

        return res.status(200).json(new ApiResponse(201, { updateUser }, "User Successfully Converted to Doctor Role"))

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: "failed",
            message: "Server error",
        });
    }
})


const UploadReport = asyncHandler(async (req, res) => {
    try {
        const { patientId } = req.params; // Expecting appointment ID in request params
        console.log(patientId)

        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            throw new ApiError(402, "invalid ObjectId")
        }

        const tests = await Test.findOne({ patient: patientId })
        if (!tests) {
            throw new ApiError(400, "Appointment not found")
        }

        let newReportLocalFile;
        if (req.file && req.file.path) {
            newReportLocalFile = req.file.path;
        }
        let uploadReportFile
        if (newReportLocalFile) {
            uploadReportFile = await uploadOnCloudinary(newReportLocalFile)
        }
        const UploadReport = await Test.findByIdAndUpdate(
            { _id: tests._id },
            { report: uploadReportFile?.url || "", ...req.body },
            { new: true }
        );

        if (!UploadReport) {
            throw new ApiError(500, "failed to update Appointment")
        }

        if (newReportLocalFile && tests?.report) {
            await deleteFromCloudinary(tests.report)
        }
        return res.status(200).json(new ApiResponse(201, { UploadReport }, `Doctors Appointment Updated Successfully`));


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: "failed",
            message: "Server error",
        });
    }
})



export { SearchUserData, UserUpdate, UploadReport }