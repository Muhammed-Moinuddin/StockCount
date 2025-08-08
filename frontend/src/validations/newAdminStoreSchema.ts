import * as Yup from "yup";

export const newAdminStoreSchema = Yup.object({
    username: Yup.string().required("Username is required"),
    fullname: Yup.string().required("Full name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    storeName: Yup.string().required("Store name is required"),
    storeAddress: Yup.string().required("Store address is required"),
})