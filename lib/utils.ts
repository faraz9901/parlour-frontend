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

  if (error.response?.data) {
    const errorMessage = error.response.data as { message: string };
    return errorMessage.message;
  }

  if (!error.response) {
    return "Something went wrong"
  }

  return "Something went wrong";
};

export { api, cn, getErrorMessage };



