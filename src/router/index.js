import Vue from 'vue'
import VueRouter from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import UserView from '../views/element/UserView.vue'
import QuestionView from '../views/element/QuestionView.vue'

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
    meta: { requiresAuth: true }
  },
  {
    path: '/question',
    name: 'question',
    component: QuestionView,
    meta: { requiresAuth: true }
  },
  {
    path: '/',
    redirect: '/login'
  }
]

const router = new VueRouter({
  routes
})

// 路由守卫 - 验证登录状态
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  // 需要登录的页面
  if (to.meta.requiresAuth) {
    if (token) {
      next()
    } else {
      next('/login')
    }
  } else {
    // 已登录用户访问登录页，跳转到用户管理
    if (to.path === '/login' && token) {
      next('/user')
    } else {
      next()
    }
  }
})

export default router