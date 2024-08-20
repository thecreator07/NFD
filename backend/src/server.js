import dotenv from "dotenv"
import "dotenv/config"
import connectDB from "./DB/index.js"
import { app } from "./app.js"



dotenv.config({
    path: ".env"
})



const PORT = process.env.PORT || 4000


connectDB().then(() => {
    app.on("Error", (err) => {
        console.log(err)
    })
    app.listen(PORT, () => {
        console.log(`server running on PORT: http://localhost:${PORT}`)
    })
}).catch((err) => {
    console.log("MongoDb connection failed ", err)
})