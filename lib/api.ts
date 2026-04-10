import axios from "axios"

const API_BASE = process.env.NEXT_PUBLIC_PROD_API || "https://gids-7pni.onrender.com";
const api = axios.create({
  baseURL: `${API_BASE}/api/auth`, 
  headers: {
    "Content-Type": "application/json",
  },
})


export const registerUser = async (userData: any) => {
  try {
    const response = await api.post("/signup", userData)
    return response.data
  } catch (error) {
    console.error("Registration failed:", error)
    throw error
  }
}



export const loginUser = async (credentials: any) => {
  try {
    const response = await api.post("/login", credentials)
    return response.data
  } catch (error) {
    console.error("Login failed:", error)
    throw error
  }
}

