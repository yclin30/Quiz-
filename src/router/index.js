import Vue from 'vue'
import VueRouter from 'vue-router'
import { Message } from 'element-ui'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import UserView from '../views/element/UserView.vue'
import QuestionView from '../views/element/QuestionView.vue'
import QuizView from '../views/QuizView.vue'
import QuizResultView from '../views/QuizResultView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresAuth: false }
  },
  {
    path: '/user',
    name: 'user',
    component: UserView,
    meta: { 
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/question',
    name: 'question',
    component: QuestionView,
    meta: { 
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/quiz',
    name: 'quiz',
    component: QuizView,
    meta: { 
      requiresAuth: true,
      requiresAdmin: false
    }
  },
  {
    path: '/quiz/result/:recordId',
    name: 'quizResult',
    component: QuizResultView,
    meta: { 
      requiresAuth: true,
      requiresAdmin: false
    }
  },
  {
    path: '/',
    redirect: '/login'
  }
]

const router = new VueRouter({
  routes
})

// 🔧 优化后的路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userInfoStr = localStorage.getItem('userInfo')
  
  // 🔧 如果访问登录或注册页面
  if (to.path === '/login' || to.path === '/register') {
    // 如果已经登录，重定向到对应页面
    if (token && userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr)
        const targetPath = userInfo.userRole === 1 ? '/user' : '/quiz'
        
        // 🔧 使用 next(false) 取消导航，然后使用 replace 跳转
        if (to.path !== targetPath) {
          next(targetPath)
        } else {
          next()
        }
      } catch (e) {
        console.error('解析用户信息失败', e)
        next()
      }
    } else {
      next()
    }
    return
  }

  // 需要登录的页面
  if (to.meta.requiresAuth) {
    if (! token) {
      Message.error('请先登录')
      next('/login')
      return
    }

    // 需要管理员权限的页面
    if (to. meta.requiresAdmin) {
      try {
        const userInfo = JSON.parse(userInfoStr || '{}')
        if (userInfo.userRole !== 1) {
          Message.error('无权限访问，仅限管理员')
          next('/quiz') // 🔧 普通用户跳转到答题页面而不是登录页
          return
        }
      } catch (e) {
        console.error('解析用户信息失败', e)
        Message.error('登录信息异常，请重新登录')
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        next('/login')
        return
      }
    }

    next()
  } else {
    next()
  }
})

export default router