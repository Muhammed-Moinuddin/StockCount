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

//Admin request with creation of new store.
export const signupWithNewStore = asyncHandler( async(req, res) => {
    //signup steps.
    //take data from req body
    const {username, fullname, email, password, storeName, storeAddress} = req.body;

    //check the data
    if(!username || !fullname || !email || !password || !storeName || !storeAddress){
        throw new ApiError(500, "All fields are required");
    }

    //check user is new or not.
    const userExists = await User.findOne({
        $or: [{username}, {email}]    
    })
    if(userExists){
        throw new ApiError(409, "Username or email already existed");
    }
    const storeExists = await Store.findOne({ name: storeName });
    if(storeExists){
        throw new ApiError(409, "Store with this name already exists");
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
    const verifyUrl = `${process.env.API_BASE_URL}/api/auth/verify-admin-new-store?token=${verificationToken}`;

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

//Verifying Admin & store creation request from Super Admin
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
    let code;
    let exists = true;
    while (exists) {
        code = crypto.randomBytes(4).toString("hex");
        exists = await Store.findOne({ code });
    }    

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

    res.status(201).json(new ApiResponse(201, "Store and Admin created successfully."));
});

export const signupWithExistingStore = asyncHandler( async(req, res) => {
    //Get data from the request.
    const {username, fullname, email, password, storeCode, storeName, role} = req.body;

    //Check everything is provided.
    if (!username || !fullname || !email || !password || !storeCode || !storeName || !role ) {
        throw new ApiError(400, "All fields are required.");
    }

    //checking the role
    const normalizedRole = role.trim().toUpperCase();
    if(!Object.values(ROLES).includes(normalizedRole)){
        throw new ApiError(400, "Invalid role selected.");
    }

    //Find store by code.
    const store = await Store.findOne({
        $and: [{code: storeCode}, {name: storeName}]
    }).populate("owner");
    if(!store){
        throw new ApiError(404, "Store Not found");
    }

    //Check does user already exists.
    const userExists = await User.findOne({ $or: [{username}, {email}], store: store._id});
    if (userExists) {
        throw new ApiError(409, "Username or email already exists in store");
    }

    //hashing password
    const hashedPassword = await bcrypt.hash(password, 10);

    //creating verificationToken
    const token = jwt.sign(
        {username, fullname, email, password: hashedPassword, role: normalizedRole, storeId: store._id},
        process.env.JWT_SECRET,
        {expiresIn: '1d'});

    //creating verification Url
    const verifyUrl = `${process.env.API_BASE_URL}/api/auth/verify-join-existing-store?token=${token}`;

    //using sendEmail Utility to send verification url to super admin
    await sendEmail({
        to: store.owner.email,
        subject: "Approval to join Store",
        html: `
          <h3>Approval to join Store</h3>
          <p>A user is requesting to join store:</p>
          <ul>
            <li><b>Username:</b> ${username}</li>
            <li><b>Email:</b> ${email}</li>
            <li><b>For Role:</b> ${role}</li>
          </ul>
          <a href="${verifyUrl}">Click to Approve</a>
        `,
      });
  
      return res.status(200).json(new ApiResponse(200, "Verification email sent to store owner for approval."));
});

export const verifyJoinExistingStore = asyncHandler( async(req, res) => {
    //req mai sai token nikala
    const { token } = req.query;

    //us token ko decode kia
    const signupData = jwt.verify(token, process.env.JWT_SECRET);
    const {username, fullname, email, password, role, storeId} = signupData;

    //data ko check kia empty tou nhi
    if (!username || !fullname || !email || !password || !role || !storeId) {
        throw new ApiError(400, "Token is missing required fields");
    }

    const userExists = await User.findOne({ $or: [{username}, {email}], store: storeId._id});    
});