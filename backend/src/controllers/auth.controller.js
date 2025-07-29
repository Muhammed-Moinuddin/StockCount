import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Store } from "../models/store.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import {ROLES} from "../../constants.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const { ADMIN, STAFF } = ROLES;

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
    const verifyUrl = `${process.env.API_BASE_URL}/api/auth/verify-admin?token=${verificationToken}`;

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

export const verifyAdminNewStore = asyncHandler( async(req, res) => {

    //req mai sai token nikala
    const { token } = req.query;

    //us token ko decode kia
    const signupData = jwt.verify(token, process.env.JWT_SECRET);
    const {username, fullname, email, password, storeName, storeAddress} = signupData;

    //data ko check kia empty tou nhi
    if (!username || !fullname || !email || !password || !storeName || !storeAddress) {
        throw new ApiError(400, "Token is missing required fields");
    }

    //dekha already created tou nhi hai
    const userExists = await User.findOne({ $or: [{username}, {email}]});
    const storeExists = await Store.findOne({name: storeName});
    if (userExists || storeExists) {
        throw new ApiError(409, "User or Store already exists");
    };

    //generate unique store code.
    const code = crypto.randomBytes(4).toString("hex"); //8-char code

    //Store or user create krna
    const newStore = await Store.create({
        name: storeName,
        code,
        address: storeAddress,
        owner: null
    });

    const newUser = await User.create({
        username,
        fullname,
        email,
        password,
        role: ADMIN,
        isOwner: true,
        store: newStore._id,
    });

    newStore.owner = newUser._id;
    await newStore.save();

    res.status(200).json(new ApiResponse(201, "Store and Admin created successfully."));
})  