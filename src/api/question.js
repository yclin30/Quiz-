import request from '@/utils/request'

/**
 * 添加题目
 */
export function addQuestion(data) {
  return request({
    url: '/question/addQuestion',
    method: 'post',
    data: {
      question: data.question,
      optiona: data.optiona,
      optionb: data.optionb,
      optionc: data.optionc,
      optiond: data.optiond,
      answer: data.answer.toLowerCase() // 转换为小写
    }
  })
}

/**
 * 分页查询题目列表
 */
export function getQuestionList(params) {
  return request({
    url: '/question/list',
    method: 'get',
    params
  })
}

/**
 * 关键词搜索题目
 */
export function searchQuestion(keyword) {
  return request({
    url: '/question/search',
    method: 'get',
    params: { keyword }
  })
}

/**
 * 删除题目（逻辑删除）
 */
export function deleteQuestion(id) {
  return request({
    url: `/question/soft/${id}`,
    method: 'delete'
  })
}