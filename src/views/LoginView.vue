<template>
  <div class="login-container">
    <el-card class="login-card">
      <div slot="header" class="clearfix">
        <span style="font-size: 24px; font-weight: bold"
          >Quiz 后台管理系统</span
        >
      </div>

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
            @keyup.enter.native="handleLogin"
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="handleLogin"
            :loading="loading"
            style="width: 100%"
            >登 录</el-button
          >
        </el-form-item>

        <el-form-item>
          <el-button type="text" @click="goToRegister"
            >还没有账号？去注册</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { login } from "@/api/user";

export default {
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
    handleLogin() {
      this.$refs.loginForm.validate(async (valid) => {
        if (!valid) {
          return false;
        }

        this.loading = true;
        try {
          const res = await login(this.loginForm);

          // 保存 Token 和用户信息
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("userInfo", JSON.stringify(res.data.user));

          this.$message.success("登录成功");

          // 跳转到用户管理页面
          this.$router.push("/user");
        } catch (error) {
          console.error("登录失败：", error);
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
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
}
</style>
