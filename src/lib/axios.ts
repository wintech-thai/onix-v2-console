import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// origin เดียวกัน ไม่ต้อง withCredentials ก็ได้
export const api = axios.create({
  baseURL: "/api/bff",
});

// แนะนำให้ใส่ default header นี้กับ “write methods” เพื่อผ่าน CSRF check ที่ BFF
api.interceptors.request.use((config) => {
  if (config.method && ["post", "put", "patch", "delete"].includes(config.method)) {
    config.headers = config.headers ?? {};
    (config.headers as any)["x-requested-with"] = "XMLHttpRequest";
  }
  return config;
});

// axios
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;

    if (status === 401) {
      window.location.href = "/auth/sign-in";
      return;
    }
    return Promise.reject(err);
  }
);

