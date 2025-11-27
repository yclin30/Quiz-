<template>
  <div class="register-container">
    <el-card class="register-card">
      <div slot="header" class="clearfix">
        <span style="font-size: 24px; font-weight: bold">用户注册</span>
      </div>

      <el-form
        :model="registerForm"
        :rules="rules"
        ref="registerForm"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="userName">
          <el-input
            v-model="registerForm.userName"
            placeholder="请输入用户名（至少4位）"
            clearable
          ></el-input>
        </el-form-item>

        <el-form-item label="密码" prop="userPassword">
          <el-input
            v-model="registerForm.userPassword"
            type="password"
            placeholder="请输入密码（至少8位）"
            show-password
          ></el-input>
        </el-form-item>

        <el-form-item label="确认密码" prop="checkPassword">
          <el-input
            v-model="registerForm.checkPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="handleRegister"
            :loading="loading"
            style="width: 100%"
            >注 册</el-button
          >
        </el-form-item>

        <el-form-item>
          <el-button type="text" @click="goToLogin">已有账号？去登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { register } from "@/api/user";

export default {
  data() {
    const validateCheckPassword = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.registerForm.userPassword) {
        callback(new Error("两次输入密码不一致"));
      } else {
        callback();
      }
    };

    return {
      registerForm: {
        userName: "",
        userPassword: "",
        checkPassword: "",
      },
      rules: {
        userName: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 4, message: "用户名长度不能小于4位", trigger: "blur" },
        ],
        userPassword: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 8, message: "密码长度不能小于8位", trigger: "blur" },
        ],
        checkPassword: [
          { required: true, message: "请再次输入密码", trigger: "blur" },
          { validator: validateCheckPassword, trigger: "blur" },
        ],
      },
      loading: false,
    };
  },
  methods: {
    handleRegister() {
      this.$refs.registerForm.validate(async (valid) => {
        if (!valid) {
          return false;
        }

        this.loading = true;
        try {
          await register(this.registerForm);

          this.$message.success("注册成功，请登录");
          this.$router.push("/login");
        } catch (error) {
          console.error("注册失败：", error);
        } finally {
          this.loading = false;
        }
      });
    },

    goToLogin() {
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-card {
  width: 450px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
}
</style>
