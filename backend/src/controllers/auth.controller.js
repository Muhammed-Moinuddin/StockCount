import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.model";

export const signupWithNewStore = asyncHandler( async(req, res) => {
    //signup steps.
    //take data from req body
    const {username, fullname, email, password, storeName, storeAddress} = req.body;

    //check the data
    if(!username, !fullname, !email, !password, !storeName, !storeAddress){
        throw new ApiError(500, "All fields are required");
    }

    //check user is new or not.
    const existingUser = await User.findOne({
        $or: [{username}, {email}]    
    })
    if(existingUser){
        throw new ApiError(409, "Username or email already existed");
    }

    //hashing password
    const hashedPassword = await bcrypt.hash(password, 10);

    //generating verification token
    const verificationToken = jwt.sign(
        { username, fullname, email, password: hashedPassword, storeName, storeAddress },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )
});