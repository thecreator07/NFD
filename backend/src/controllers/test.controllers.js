// Create Test
// Get All Tests
// Get Test by ID
// Update Test
// Delete Test

import mongoose from "mongoose";
import { Test } from "../models/test.models.js";
// import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const CreateTest = asyncHandler(async (req, res) => {
    const { tests, description } = req.body

    const patienttests = await Test.findOne({ patient: req.user?._id })

    if (patienttests) {
        const testDetails = await Test.findByIdAndUpdate({ _id: patienttests._id }, {
            $set: { tests, description }
        }, { new: true }
        )
        return res.status(200).json(new ApiResponse(201,{testDetails},"NEW TESTS CREATED"))
    }

    const newTest = await Test.create({
        patient: req.user?._id,
        tests,
        description,
    })

    if (!newTest) {
        throw new ApiError(401, "something went wrong during tests creation")
    }


    const responsetest = await Test.findById(newTest._id)

    return res.status(201).json(new ApiResponse(200, { responsetest }, "test created successfully"))

})

const UpdateTest = asyncHandler(async (req, res) => {
    const { tests, description } = req.body

    if (!description) {
        throw new ApiError(400, "tests or Description is required")
    }
    // const patient = await Test.findOne({ patient: req.user?._id })


    const testDatails = await Test.findOneAndUpdate({ patient: req.user?._id }, {
        $set: { tests, description }
    }, { new: true }
    )

    if (!testDatails) {
        throw new ApiError(401, "Tests updation Failed")
    }

    return res.status(200).json(new ApiResponse(201, { testDatails }, "Patient test are updated"))

})


const RemoveTest = asyncHandler(async (req, res) => {
    const { tests } = req.body

    // if (!tests) {
    //     throw new ApiError(400, "Something went wrong di=uring tests Removal")
    // }

    const result = await Test.updateOne(
        { patient: req.user?._id },
        { $pull: { tests: { $in: tests } } }
    );
    if (!result) {
        throw new ApiError(401, "updation in Db failed")
    }
    return res.status(200).json(new ApiResponse(201, { result }, "Tests Updated successfully"))
})



export { CreateTest, UpdateTest, RemoveTest }