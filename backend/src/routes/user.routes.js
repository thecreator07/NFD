import { Router } from "express";
import { changeCurrentPassword, currentuser, loginUser, logoutUser, refreshAccessToken, registerUser, updateUserDetails } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router()

router.route("/register").post(registerUser)
// router.route("/sendmail").post(SendEmail)
// router.route('/verifymail').post(VerifyEmail)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJwt, logoutUser)
router.route("/refreshToken").post(verifyJwt, refreshAccessToken);
router.route("/changePassword").post(verifyJwt, changeCurrentPassword);
router.route("/current_User").get(verifyJwt, currentuser);
router
    .route("/update_account")
    .patch(
        verifyJwt,
        upload.fields([{ name: "avatar", maxCount: 1 }]),
        updateUserDetails
    );
export default router