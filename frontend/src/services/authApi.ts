import axios from "axios";

// axios.defaults.withCredentials = true;

export const signupWithNewStore = async(data: any) => {
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/signup-admin-new-store`, data);
    return res.data
}