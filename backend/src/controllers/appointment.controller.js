import mongoose from "mongoose";
import { DoctorAppointment } from "../models/appointment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { User } from "../models/user.models.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/Cloudinary.js";


//Patient access 
const bookAppointment = asyncHandler(async (req, res) => {
    // const { appointmentDate, appointmentTime, reasonForVisit } = req.body;
    const { doctorId } = req.params


    try {
        const appointment = await DoctorAppointment.findOne({ doctor: doctorId, patient: req.user?._id })
        if (appointment) {
            const addAppointment = await DoctorAppointment.findByIdAndUpdate({ _id: appointment._id }, { $set: { ...req.body } }, { new: true })
            if (!addAppointment) {
                throw new ApiError(404, "something wennt wrong during appointment")
            }

            return res.status(201).json(new ApiResponse(200, { addAppointment }, "new appointment created"))
        }
        const newAppointment = await DoctorAppointment.create({
            patient: req.user?._id,
            doctor: doctorId,
            ...req.body
        })

        const appointmentdetails = await DoctorAppointment.findById(newAppointment._id)

        return res.status(201).json(new ApiResponse(200, { appointmentdetails }, "Appointment to Doctor Created Successfully"));
    } catch (error) {
        console.error('Error booking appointment:', error);
        return res.status(500).json({ message: 'Error booking appointment', error });
    }
})

const updateAppointmentByUser = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params; // Expecting appointment ID in request params
    // const { reasonForVisit } = req.body; // Expecting fields to update

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
        throw new ApiError(400, "Invalid ObjectId");
    }

    const appointment = await DoctorAppointment.findByIdAndUpdate({ _id: appointmentId }, { $set: { ...req.body } }, { new: true })

    if (!appointment) {
        throw new ApiError(400, "Something went wrong during updating appointment")
    }

    return res.status(200).json(new ApiResponse(201, { appointment }, "Appointment updated successfully"))

})


const deleteAppointment = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params; // Expecting appointment ID in request params

    if (!appointmentId) {
        throw new ApiError(400, "something wrong happen")
    }
    const deletedAppointment = await DoctorAppointment.findByIdAndDelete(appointmentId);
    console.log(deleteAppointment)
    if (!deletedAppointment) {
        return res.status(404).json({ message: 'Appointment not found' });
    }

    return res.status(200).json(new ApiResponse(201, { deletedAppointment }, "Doctors Appointment Deleted"));

})

const GetAppointmentByUser = asyncHandler(async (req, res) => {

    const appointment = await DoctorAppointment.findOne({ patient: req.user?._id })
    console.log(appointment)
    if (!appointment) {
        throw new ApiError(500, "Appointment not found")
    }

    return res.status(200).json(new ApiResponse(201, { appointment }, "Appointment fetched successfully"))

})







//Doctors Access
const UpdateAppointmentByDoctor = asyncHandler(async (req, res) => {
    // const { status } = req.body
    const { appointmentId } = req.params; // Expecting appointment ID in request params
    console.log(appointmentId)

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
        throw new ApiError(402, "invalid ObjectId")
    }

    const appointmentToUpdate = await DoctorAppointment.findById(appointmentId)
    if (!appointmentToUpdate) {
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
    const updateAppointment = await DoctorAppointment.findByIdAndUpdate(
        { _id: appointmentId },
        { report: uploadReportFile?.url || "", ...req.body },
        { new: true }
    );

    if (!updateAppointment) {
        throw new ApiError(500, "failed to update Appointment")
    }

    if (newReportLocalFile && appointmentToUpdate?.report) {
        await deleteFromCloudinary(appointmentToUpdate.report)
    }
    return res.status(200).json(new ApiResponse(201, { updateAppointment }, `Doctors Appointment Updated Successfully`));

})


const GetAllAppointment = asyncHandler(async (req, res) => {

    const appointments = await DoctorAppointment.aggregate([
        {
            $match: {
                doctor: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
    ])
    // console.log(appointments)

    return res.status(200).json(new ApiResponse(201, { appointments }, "All Appointment Fetched Successfully"))
})

const GetPatientDetails = asyncHandler(async (req, res) => {
    const { patientId } = req.params

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
        throw new ApiError(404, "Something went wrong during fetching patient data")
    }
    const patient = await User.findById(patientId).select("-email -password -refreshToken -otp -otpExpire -emailVerified ")
    if (!patient) {
        throw new ApiError(400, "Patient not find")
    }
    // console.log(patient)
    return res.status(201).json(new ApiResponse(200, { patient }, "Patient Data fetched Successfully"))
})



export { bookAppointment, deleteAppointment, updateAppointmentByUser, UpdateAppointmentByDoctor, GetAllAppointment, GetPatientDetails, GetAppointmentByUser }