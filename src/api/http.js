import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:8080", // 如果有 context-path 记得加上，比如 /api
  timeout: 10000
});

// 请求拦截器（可添加 token 等）
http.interceptors.request.use(
  config => {
    // 例如：config.headers.Authorization = localStorage.getItem("token");
    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截器统一处理
http.interceptors.response.use(
  response => {
    // 后端统一返回格式 { code, msg, data }
    const res = response.data;
    if (res.code !== 1 && res.code !== 200) {
      // 约定成功code=1 或 200，视你后端实现而定
      console.error("接口错误：", res.msg || "未知错误");
    }
    return res;
  },
  error => {
    console.error("网络/服务器异常:", error);
    return Promise.reject(error);
  }
);

export default http;