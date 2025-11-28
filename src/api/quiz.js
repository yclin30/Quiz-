import request from '@/utils/request'

/**
 * 获取随机题目
 * @param {number} count - 题目数量
 */
export function getRandomQuestions(count = 10) {
  return request({
    url: '/quiz/random',
    method: 'get',
    params: { count }
  })
}

/**
 * 提交答题结果
 * @param {Object} data - 答题数据
 * @param {Array} data.answers - 答案列表 [{questionId, userAnswer}]
 */
export function submitQuiz(data) {
  return request({
    url: '/quiz/submit',
    method: 'post',
    data: {
      answers: data.answers
    }
  })
}

/**
 * 获取答题历史记录
 */
export function getQuizHistory() {
  return request({
    url: '/quiz/history',
    method: 'get'
  })
}

/**
 * 获取答题详情
 * @param {number} recordId - 答题记录ID
 */
export function getQuizResult(recordId) {
  return request({
    url: `/quiz/result/${recordId}`,
    method: 'get'
  })
}