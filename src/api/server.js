import request from "@/utils/request";

/**
 * 获取标签列表
 * @param {*} params
 */
export function tags(params) {
  return request.post("/admin/server/tags", params);
}

/**
 * 添加标签
 * @param {*} params
 */
export function addtag(params) {
  return request.post("/admin/server/addtag", params);
}

/**
 * 删除标签
 * @param {*} params
 */
export function deltag(params) {
  return request.post("/admin/server/deltag", params);
}

/**
 * 物品类型
 * @param {*} params
 */
export function goodstypes(params) {
  return request.post("/admin/server/goodstypes", params);
}

/**
 * 添加物品类型
 * @param {*} params
 */
export function addgoodstype(params) {
  return request.post("/admin/server/addgoodstype", params);
}

/**
 * 编辑物品类型
 * @param {*} params
 */
export function editgoodstype(params) {
  return request.post("/admin/server/editgoodstype", params);
}

/**
 * 删除物品类型
 * @param {*} params
 */
export function delgoodstype(params) {
  return request.post("/admin/server/delgoodstype", params);
}

/**
 * 物品列表
 * @param {*} params
 */
export function goods(params) {
  return request.post("/admin/server/goods", params);
}

/**
 * 增加物品
 * @param {*} params
 */
export function addgoods(params) {
  return request.post("/admin/server/addgoods", params);
}

/**
 * 编辑物品
 * @param {*} params
 */
export function editgoods(params) {
  return request.post("/admin/server/editgoods", params);
}

/**
 * 删除物品
 * @param {*} params
 */
export function delgoods(params) {
  return request.post("/admin/server/delgoods", params);
}

/**
 * OSS token
 * @param {*} params
 */
export function upload(params) {
  let config = {
    headers: { "Content-Type": "multipart/form-data" }
  };
  return request.post("/admin/server/upload", params, config);
}
