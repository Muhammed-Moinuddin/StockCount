import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export const signupWithNewStore = asyncHandler( async(req, res) => {
    const {username, fullname, email, password, storeName, storeAddress} = req.body;

    if(!username, !fullname, !email, !password, !storeName, !storeAddress){
        throw new ApiError(500, "All fields are required");
    }
});