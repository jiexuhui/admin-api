import { constantRouterMap } from "@/router";
import { getRoleMenus } from "@/api/login";
/* Layout */
import Layout from "@/views/layout/Layout";

/**
 * 通过meta.role判断是否与当前用户权限匹配
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return route.meta.roles.indexOf(roles) >= 0;
  } else {
    return true;
  }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param asyncRouterMap
 * @param roles
 */
function filterAsyncRouter(asyncRouterMap, roles) {
  const accessedRouters = asyncRouterMap.filter(route => {
    if (hasPermission(roles, route)) {
      if (route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children, roles);
      }
      return true;
    }
    return false;
  });
  return accessedRouters;
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers;
      state.routers = constantRouterMap.concat(routers);
      // state.routers = constantRouterMap;
    }
  },
  actions: {
    GenerateRoutes({ commit }, data) {
      return new Promise((resolve, reject) => {
        const { roles } = data;
        getRoleMenus(roles)
          .then(response => {
            let accessedRouters = [];
            const menus = response.data;
            if (menus && menus.length > 0) {
              for (const m of menus) {
                const baseRoute = {
                  path: "/" + m.path,
                  meta: m.meta,
                  name: m.name,
                  component: Layout
                };
                const childRoute = [];
                if (m.children && m.children.length > 0) {
                  for (const child of m.children) {
                    childRoute.push({
                      path: child.path,
                      meta: child.meta,
                      name: child.name,
                      component: () => import(`@/views/${m.path}/${child.path}`)
                    });
                  }
                  baseRoute.children = childRoute;
                }
                const notfound = { path: "*", redirect: "/404", hidden: true };
                accessedRouters.push(baseRoute);
                accessedRouters.push(notfound);
              }
            }
            console.log("accessedRouters",accessedRouters);
            commit("SET_ROUTERS", accessedRouters);
            // setToken(data);
            resolve();
          })
          .catch(error => {
            reject(error);
          });
        // let accessedRouters;
        // console.log("roles", roles);
        // if (roles === "admin") {
        //   console.log("asyncRouterMap:%o", asyncRouterMap);
        //   accessedRouters = asyncRouterMap;
        // } else {
        //   accessedRouters = filterAsyncRouter(asyncRouterMap, roles);
        // }
        // commit("SET_ROUTERS", accessedRouters);
        // resolve();
      });
    }
  }
};

export default permission;
