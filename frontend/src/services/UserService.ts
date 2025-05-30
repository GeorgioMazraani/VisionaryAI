/**
 * UserService.ts
 *
 * Provides all API interactions related to users.
 * Includes authenticated routes (get, patch, delete) and public login.
 */

import http from "../utils/http-common"; // Axios instance with baseURL
import { getTokenBearer } from "../utils/utils";

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  password_hash?: string;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface PatchUserData {
  username?: string;
  email?: string;
  password?: string;
}

// ───── PUBLIC ─────
const login = (credentials: LoginCredentials) => {
  return http.post("/users/auth/login", credentials);
};

// ───── AUTHENTICATED ─────
const getAllUsers = () => {
  return http.get<User[]>("/users", {
    headers: { Authorization: getTokenBearer() },
  });
};

const getUserById = (id: number) => {
  return http.get<User>(`/users/${id}`, {
    headers: { Authorization: getTokenBearer() },
  });
};

const createUser = (data: Partial<User>) => {
  return http.post("/users", data); // no auth required
};

const patchUsername = (id: number, username: string) => {
  return http.patch(`/users/${id}/username`, { username }, {
    headers: { Authorization: getTokenBearer() },
  });
};

const patchEmail = (id: number, email: string) => {
  return http.patch(`/users/${id}/email`, { email }, {
    headers: { Authorization: getTokenBearer() },
  });
};

const patchPassword = (id: number, password: string) => {
  return http.patch(`/users/${id}/password`, { password }, {
    headers: { Authorization: getTokenBearer() },
  });
};

const deleteUser = (id: number) => {
  return http.delete(`/users/${id}`, {
    headers: { Authorization: getTokenBearer() },
  });
};

// Export all functions
const UserService = {
  login,
  getAllUsers,
  getUserById,
  createUser,
  patchUsername,
  patchEmail,
  patchPassword,
  deleteUser,
};

export default UserService;
