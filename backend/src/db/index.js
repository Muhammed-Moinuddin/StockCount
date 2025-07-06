import mongoose from "mongoose";

const connectDB = async() => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`);
        //logging connection object property host - We connect different DBs for checking 
        console.log(`\nMongoDB connected ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection error", error);
        //to terminate the process synchronously with an exit status code of 1(status code of failure)
        process.exit(1);
    }
}

export default connectDB;
