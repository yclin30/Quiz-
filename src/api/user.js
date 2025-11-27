import request from '@/utils/request'

export function getUserList(params) {
  return request({
    url: '/user/users',
    method: 'get',
    params
  })
}

// ⚠️ 修改这个函数
export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data: {
      userName: data.userName,
      userPassword: data.userPassword
    }
  })
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser() {
  return request({
    url: '/user/current',
    method: 'get'
  })
}

/**
 * 用户注册
 */
export function register(data) {
  return request({
    url: '/user/register',
    method: 'post',
    data: {
      userName: data.userName,
      userPassword: data.userPassword,
      checkPassword: data.checkPassword
    }
  })
}


export function deleteUser(id) {
  return request({
    url: `/user/${id}`,
    method: 'delete'
  })
}

export function searchUsers(username) {
  return request({
    url: '/user/search',
    method: 'get',
    params: { username }
  })
}