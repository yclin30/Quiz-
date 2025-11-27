import request from '@/utils/request'

export function getUserList(params) {
  return request({
    url: '/user/users',
    method: 'get',
    params
  })
}

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

export function getCurrentUser() {
  return request({
    url: '/user/current',
    method: 'get'
  })
}

export function register(data) {
  return request({
    url: '/user/register',
    method: 'post',
    data: {
      userName: data.userName,
      userPassword: data. userPassword,
      checkPassword: data.checkPassword
    }
  })
}

export function addUser(data) {
  return request({
    url: '/user/add',
    method: 'post',
    data: {
      userName: data.userName,
      userPassword: data. userPassword,
      checkPassword: data.checkPassword,
      userRole: data.userRole
    }
  })
}

/**
 * 🆕 更新用户信息
 */
export function updateUser(data) {
  return request({
    url: '/user/update',
    method: 'put',
    data: {
      id: data.id,
      userName: data.userName,
      userPassword: data.userPassword,
      userRole: data.userRole
    }
  })
}

/**
 * 🆕 根据ID获取用户详情
 */
export function getUserById(id) {
  return request({
    url: `/user/${id}`,
    method: 'get'
  })
}

export function resetPassword(id) {
  return request({
    url: `/user/resetPassword/${id}`,
    method: 'put'
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