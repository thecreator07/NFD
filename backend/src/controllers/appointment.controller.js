import mongoose from "mongoose";
import { DoctorAppointment } from "../models/appointment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/AsyncHandler.js";



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

const updateAppointment = asyncHandler(async (req, res) => {
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





//Doctors Access
const UpdateAppointmentStatus = asyncHandler(async (req, res) => {
    const { status } = req.body
    const { appointmentId } = req.params; // Expecting appointment ID in request params

    try {
        const updateAppointment = await DoctorAppointment.findByIdAndUpdate(
            { _id: appointmentId },
            { status: status },
            { new: true }
        );

        if (!updateAppointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        return res.status(200).json(new ApiResponse(201, { updateAppointment }, `Doctors Appointment Updated Successfully-${status}`));
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        return res.status(500).json({ message: 'Error cancelling appointment', error });
    }
})

export { bookAppointment, updateAppointment, deleteAppointment, UpdateAppointmentStatus }