
import { Router } from "express";
import { verifyAdmin, verifyJwt } from "../middlewares/auth.middlewares.js";
import { SearchUserData, UploadReport, UserUpdate } from "../controllers/admin.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router()

router.route('/search').post(verifyJwt, verifyAdmin, SearchUserData)
router.route('/userUpdate/:doctorId').patch(verifyJwt, verifyAdmin, UserUpdate)
router.route('/report/:patientId').patch(verifyJwt, verifyAdmin, upload.single("report"), UploadReport)
export default router