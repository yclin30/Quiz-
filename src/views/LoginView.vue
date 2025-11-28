<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">Quiz 登录</h2>
      <el-form
        :model="loginForm"
        :rules="rules"
        ref="loginForm"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="userName">
          <el-input
            v-model="loginForm.userName"
            placeholder="请输入用户名"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="userPassword">
          <el-input
            v-model="loginForm.userPassword"
            type="password"
            placeholder="请输入密码"
            show-password
            @keyup.enter.
            native="handleLogin"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="handleLogin"
            :loading="loading"
            style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            type="text"
            @click="goToRegister"
            style="width: 100%; text-align: center"
          >
            还没有账号？立即注册
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { login } from "@/api/user";

export default {
  name: "LoginView",
  data() {
    return {
      loginForm: {
        userName: "",
        userPassword: "",
      },
      rules: {
        userName: [
          { required: true, message: "请输入用户名", trigger: "blur" },
        ],
        userPassword: [
          { required: true, message: "请输入密码", trigger: "blur" },
        ],
      },
      loading: false,
    };
  },
  methods: {
    async handleLogin() {
      this.$refs.loginForm.validate(async (valid) => {
        if (!valid) {
          return false;
        }

        this.loading = true;
        try {
          const res = await login(this.loginForm);

          // 保存 token 和用户信息
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("userInfo", JSON.stringify(res.data.user));

          this.$message.success("登录成功");

          // 根据用户角色跳转，使用 replace 而不是 push
          const userRole = res.data.user.userRole;
          if (userRole === 1) {
            // 管理员跳转到用户管理
            this.$router.replace("/user");
          } else {
            // 普通用户跳转到答题页面
            this.$router.replace("/quiz");
          }
        } catch (error) {
          console.error("登录失败：", error);
          this.$message.error("登录失败，请检查用户名和密码");
        } finally {
          this.loading = false;
        }
      });
    },

    goToRegister() {
      this.$router.push("/register");
    },
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  max-width: 90%;
}

.login-title {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 24px;
}
</style>
