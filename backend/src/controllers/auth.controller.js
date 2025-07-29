import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Store } from "../models/store.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

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

    //Creating verification url
    const verifyUrl = `${process.env.CLIENT_URL}/verify-admin?token=${verificationToken}`;

    //using sendEmail Utility to send verification url to super admin
    await sendEmail({
        to: process.env.EMAIL_USER,
        subject: "New Store + Admin Approval",
        html: `
          <h3>New Admin + Store Approval</h3>
          <p>A user is requesting to create a new store:</p>
          <ul>
            <li><b>Username:</b> ${username}</li>
            <li><b>Email:</b> ${email}</li>
            <li><b>Store Name:</b> ${storeName}</li>
          </ul>
          <a href="${verifyUrl}">Click to Approve</a>
        `,
      });
  
      return res.status(200).json(new ApiResponse(200, "Verification email sent to Super Admin for approval."));
});