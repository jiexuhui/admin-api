/* eslint-disable */
import request from "@/utils/request";

export function loginByUsername(username, password) {
  const data = {
    username,
    password
  };
  return request.post("/admin/system/login", data);
}

export function logout() {
  return request({
    url: "/login/logout",
    method: "post"
  });
}

export function getUserInfo(token) {
  return request({
    url: "/admin/system/userinfo",
    method: "get",
    params: { token }
  });
}
