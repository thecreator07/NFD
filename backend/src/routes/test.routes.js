import { Router } from "express";
import { CreateTest, RemoveTest, UpdateTest } from "../controllers/test.controllers.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";



const router = Router()


router.route("/").post(verifyJwt, CreateTest).patch(verifyJwt, UpdateTest)
// router.route('/update').patch(verifyJwt, RemoveTest)



export default router