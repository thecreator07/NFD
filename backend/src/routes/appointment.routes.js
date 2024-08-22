import { Router } from "express";
import { bookAppointment, deleteAppointment, GetAllAppointment, GetAppointmentByUser, GetPatientDetails, UpdateAppointmentByDoctor, updateAppointmentByUser } from "../controllers/appointment.controller.js";
import { verifyDoctor, verifyJwt } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router()

// patient
router.route("/:doctorId").post(verifyJwt, bookAppointment)
router.route("/update/:appointmentId").patch(verifyJwt, updateAppointmentByUser)
router.route("/:appointmentId").delete(verifyJwt, deleteAppointment)
router.route("/").get(verifyJwt, GetAppointmentByUser)




// doctor
router.route("/doctor").get(verifyJwt, verifyDoctor, GetAllAppointment)

router.route("/doctor/patients/:patientId").get(verifyJwt, verifyDoctor, GetPatientDetails)
router.route("/doctor/:appointmentId").post(verifyJwt, verifyDoctor, upload.single("report"), UpdateAppointmentByDoctor)









export default router