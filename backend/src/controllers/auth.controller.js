import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Store } from "../models/store.model.js";
import { PendingSignup } from "../models/pendingSignup.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { ROLES, STORE_TYPE } from "../../constants.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const { ADMIN, STAFF } = ROLES;
const { NEW_STORE, EXISTING_STORE } = STORE_TYPE;

//Admin request with creation of new store.
export const signupWithNewStore = asyncHandler( async(req, res) => {
    //signup steps.
    //take data from req body
    const {username, fullname, email, password, storeName, storeAddress} = req.body;

    //check the data
    if(!username || !fullname || !email || !password || !storeName || !storeAddress){
        throw new ApiError(400, "All fields are required");
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

    const requestExists = await PendingSignup.findOne({ $or: [{ email }, { username }] });
    if (requestExists) {
        throw new ApiError(409, "Signup request already pending.");
    }

    //creating signup data as temporary data
    const pending = await PendingSignup.create({
        type: NEW_STORE,
        username,
        fullname,
        email,
        password: hashedPassword,
        storeName,
        storeAddress
    });

    //generating verification token
    const verificationToken = jwt.sign(
        { requestId: pending._id },
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
    let tokenData;
    try {
        tokenData = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        throw new ApiError(401, "Invalid or expired token");
    }
    const { requestId } = tokenData;

    const signupData = await PendingSignup.findById(requestId);
    if (!signupData) {
      throw new ApiError(404, "Signup request not found or already processed.");
    }
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
        code = `SC-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
        exists = await Store.findOne({ code });
    };

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

    // delete temp signup data
    await PendingSignup.findByIdAndDelete(requestId);

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

    const requestExists = await PendingSignup.findOne({ $or: [{ email }, { username }] });
    if (requestExists) {
        throw new ApiError(409, "Signup request already pending.");
    }

    const pending = await PendingSignup.create({
        type: EXISTING_STORE,
        username,
        fullname,
        email,
        password: hashedPassword,
        role: normalizedRole,
        storeId: store._id
    });

    //creating verificationToken
    const token = jwt.sign(
        {requestId: pending._id},
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
            <li><b>For Role:</b> ${normalizedRole}</li>
          </ul>
          <a href="${verifyUrl}">Click to Approve</a>
        `,
      });
  
      return res.status(200).json(new ApiResponse(200, "Verification email sent to store owner for approval."));
});

export const verifyJoinExistingStore = asyncHandler( async(req, res) => {
    //req mai sai token nikala
    const { token } = req.query;

    //decode token for requestId
    let tokenData;
    try {
        tokenData = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        throw new ApiError(401, "Invalid or expired token");
    }
    const {requestId} = tokenData;

    //Get signupData from that requestId
    const signupData = await PendingSignup.findById(requestId);
    if (!signupData) {
    throw new ApiError(404, "Signup request not found or already processed.");
    }
    const {username, fullname, email, password, role, storeId} = signupData;

    //data ko check kia empty tou nhi
    if (!username || !fullname || !email || !password || !role || !storeId) {
        throw new ApiError(400, "Token is missing required fields");
    }

    // Check if store still exists
    const store = await Store.findById(storeId);
    if (!store) {
        throw new ApiError(404, "Store no longer exists");
    }

    const userExists = await User.findOne({ $or: [{username}, {email}], store: storeId});
    if (userExists) {
        throw new ApiError(409, "User already exists");
    };

    const newUser = await User.create({
        username,
        fullname,
        email,
        password,
        role,
        isOwner: false,
        store: storeId,
    });

    // delete temp signup data
    await PendingSignup.findByIdAndDelete(requestId);

    res.status(201).json(new ApiResponse(201, `${role} account created successfully.`));
});