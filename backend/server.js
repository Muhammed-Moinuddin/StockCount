import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./src/db/index.js";

//loading .env content
dotenv.config({path: "./.env"});

//setting port
const PORT = process.env.PORT || 8000;

connectDB()
.then(() => {
    app.on('error', (error) => {
        console.log("Error before listening: ", error);
        throw error;
    })
    app.listen(PORT, () => {
        console.log(`Server running on port: ${PORT}`)
    })
})
.catch((error) => {
    console.log("Mongodb connection failed!!", err);
})