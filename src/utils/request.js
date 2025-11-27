import axios from 'axios'
import { Message } from 'element-ui'
import router from '@/router'

const request = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000
})

// 请求拦截器 - 添加 Token
request.interceptors.request.use(
  config => {
    // 从 localStorage 获取 Token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误：', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    
    // 你的后端成功状态码是 1
    if (res.code === 1) {
      return res
    } else {
      Message.error(res.msg || '请求失败')
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
  },
  error => {
    console.error('API 错误：', error)
    
    // 401 未授权，跳转到登录页
    if (error.response && error.response.status === 401) {
      Message.error('登录已过期，请重新登录')
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      router.push('/login')
    } else {
      Message.error(error.message || '网络错误')
    }
    
    return Promise.reject(error)
  }
)

export default request