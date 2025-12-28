import axios from "axios";

// Make sure this matches your .env file
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// The instance we will attach interceptors to
export const axiosAuth = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});