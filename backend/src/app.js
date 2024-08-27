import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import path from "path"
import { fileURLToPath } from "url"

const app = express()

app.use(
    cors({
        origin: "*",
        credentials: true,
    })
)



const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(express.json({ limit: "2000kb" }))
app.use(express.urlencoded({ extended: true, limit: "2000kb" }))
app.use(express.static(path.join(__dirname, "../dist")))
app.use(cookieParser())


import userRouter from "./routes/user.routes.js"
import testRouter from "./routes/test.routes.js"
import appointment from "./routes/appointment.routes.js"
import adminRouter from "./routes/admin.routes.js"
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tests", testRouter)
app.use("/api/v1/appointment", appointment)
app.use("/api/v1/admin", adminRouter)

export { app }