import { DoctorAppointment } from "../models/appointment.models.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/AsyncHandler.js";



//Patient access 
const bookAppointment = asyncHandler(async (req, res) => {
    // const { appointmentDate, appointmentTime, reasonForVisit } = req.body;
    const { doctorId } = req.params
    try {

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
    const updateData = req.body; // Expecting fields to update

    try {
        const updatedAppointment = await DoctorAppointment.findByIdAndUpdate(appointmentId, updateData, { new: true });

        if (!updatedAppointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        return res.status(200).json(new ApiResponse(201, { updateAppointment }, "Doctor Appointment Updated"));
    } catch (error) {
        console.error('Error updating appointment:', error);
        return res.status(500).json({ message: 'Error updating appointment', error });
    }
})


const deleteAppointment = asyncHandler(async (req, res) => {
    const { appointmentId } = req.params; // Expecting appointment ID in request params

    try {
        const deletedAppointment = await DoctorAppointment.findByIdAndDelete(appointmentId);

        if (!deletedAppointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        return res.status(200).json(new ApiResponse(201, { deletedAppointment }, "Doctors Appointment Deleted"));
    } catch (error) {
        console.error('Error deleting appointment:', error);
        return res.status(500).json({ message: 'Error deleting appointment', error });
    }
})








//Doctors Access
const UpdateAppointmentStatus = asyncHandler(async (req, res) => {
    const { status } = req.body
    const { appointmentId } = req.params; // Expecting appointment ID in request params

    try {
        const updateAppointment = await DoctorAppointment.findByIdAndUpdate(
            appointmentId,
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