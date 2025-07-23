import { asyncHandler } from "../utils/asyncHandler";

export const signupWithNewStore = asyncHandler( async(req, res) => {
    const {username, fullname, email, password, role, storeName} = req.body;

    
});