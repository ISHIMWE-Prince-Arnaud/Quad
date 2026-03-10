import axios from "axios";
import { env } from "@/lib/envValidation";
import { attachInterceptors } from "./interceptors";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: env.apiTimeoutMs,
  headers: {
    "Content-Type": "application/json",
  },
});

attachInterceptors(api);
