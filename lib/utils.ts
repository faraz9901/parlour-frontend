import axios, { AxiosError } from "axios"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}


const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});


const getErrorMessage = (error: AxiosError) => {

  if (error.response && error.response.data && typeof error.response.data === "object") {
    const data = error.response.data as { message: string };
    if (data.message) {
      return data.message;
    }
  }

  if (!error.response) {
    return "Something went wrong"
  }

  return "Something went wrong";
};

export { api, cn, getErrorMessage };



