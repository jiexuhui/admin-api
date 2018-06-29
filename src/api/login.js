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
    url: "/admin/system/logout",
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

export function getRoleMenus(role) {
  const data = { role };
  console.log("getmenu:", data);
  return request.post("/admin/system/usermenu", data);
}
