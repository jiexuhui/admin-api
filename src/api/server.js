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