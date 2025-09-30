import { api } from "@/lib/axios";
import { LoginSchemaType } from "../schema/login.schema";
import { LoginResponse } from "../types/auth.types";
import axios from "axios";

export const authApi = {
  login: (data: LoginSchemaType) => {
    return axios.post<LoginResponse>("/api/auth/login", data);
  },
  logout: {
    keys: "logout",
    api: (orgId: string) => api.post(`/api/OnlyUser/org/${orgId}/action/Logout`),
    clearCookies: () => axios.post("/api/auth/logout"),
  }
}
