import { Router } from "express";
import { bookAppointment, deleteAppointment, updateAppointment, UpdateAppointmentStatus } from "../controllers/appointment.controller.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router()

// patient
router.route("/:doctorId").post(verifyJwt, bookAppointment).delete(verifyJwt, deleteAppointment)
router.route("/update/:appointmentId").patch(verifyJwt, updateAppointment)

// doctor
router.route("/doctor/:appointmentId").post(verifyJwt, UpdateAppointmentStatus)
export default router