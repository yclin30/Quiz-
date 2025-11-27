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
      answer: data. answer. toLowerCase()
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

/**
 * 🆕 更新题目
 */
export function updateQuestion(data) {
  return request({
    url: '/question/update',
    method: 'put',
    data: {
      id: data.id,
      questionText: data.questionText,
      answer1Text: data.answer1Text,
      answer1Correct: data.answer1Correct,
      answer2Text: data.answer2Text,
      answer2Correct: data.answer2Correct,
      answer3Text: data.answer3Text,
      answer3Correct: data. answer3Correct,
      answer4Text: data.answer4Text,
      answer4Correct: data.answer4Correct
    }
  })
}

/**
 * 🆕 根据ID获取题目详情
 */
export function getQuestionById(id) {
  return request({
    url: `/question/${id}`,
    method: 'get'
  })
}