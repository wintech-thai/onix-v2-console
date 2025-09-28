import { LoginSchemaType } from "../schema/login.schema";
import { LoginResponse } from "../types/auth.types";
import axios from "axios";

export const authApi = {
  login: (data: LoginSchemaType) => {
    return axios.post<LoginResponse>("/api/auth/login", data);
  }
}
