<template>
  <el-container style="height: 100vh">
    <el-header
      style="
        font-size: 40px;
        background-color: rgb(238, 241, 246);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
      "
    >
      <span>Quiz后台管理</span>
      <div>
        <el-dropdown @command="handleCommand">
          <span
            class="el-dropdown-link"
            style="font-size: 16px; cursor: pointer"
          >
            {{ currentUser.userName
            }}<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <el-menu :default-openeds="['1']">
          <el-submenu index="1">
            <template slot="title"
              ><i class="el-icon-message"></i>管理选项</template
            >
            <el-menu-item-group>
              <el-menu-item index="1-1">
                <router-link to="/user" class="router-link"
                  >用户管理</router-link
                >
              </el-menu-item>
              <el-menu-item index="1-2">
                <router-link to="/question" class="router-link"
                  >题目管理</router-link
                >
              </el-menu-item>
            </el-menu-item-group>
          </el-submenu>
        </el-menu>
      </el-aside>

      <el-main style="padding: 20px">
        <!-- 顶部搜索表单 -->
        <el-form
          :inline="true"
          :model="formInline"
          class="demo-form-inline"
          style="margin-bottom: 20px"
        >
          <el-form-item label="用户名">
            <el-input
              v-model="formInline.user"
              placeholder="请输入用户名"
              style="width: 150px"
              clearable
              @keyup.enter="onSubmit"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit" icon="el-icon-search"
              >查询</el-button
            >
          </el-form-item>
          <el-form-item v-if="isSearching">
            <el-button @click="resetSearch" icon="el-icon-refresh-left"
              >返回列表</el-button
            >
          </el-form-item>
          <el-form-item>
            <el-button type="success" @click="onAddNewUser" icon="el-icon-plus"
              >添加用户</el-button
            >
          </el-form-item>
        </el-form>

        <!-- 用户表格 -->
        <el-table :data="tableData" style="width: 100%" v-loading="loading">
          <el-table-column label="ID" width="80">
            <template slot-scope="scope">
              <span>{{ scope.row.id }}</span>
            </template>
          </el-table-column>

          <el-table-column label="用户名" width="150">
            <template slot-scope="scope">
              <el-tag size="medium">{{ scope.row.userName }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="创建时间" width="180">
            <template slot-scope="scope">
              <i class="el-icon-time"></i>
              <span style="margin-left: 10px">{{
                formatDate(scope.row.createTime)
              }}</span>
            </template>
          </el-table-column>

          <el-table-column label="角色" width="100">
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.userRole === 1 ? 'danger' : 'info'"
                size="small"
              >
                {{ scope.row.userRole === 1 ? "管理员" : "普通用户" }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="300">
            <template slot-scope="scope">
              <el-button
                size="mini"
                @click="handleEdit(scope.$index, scope.row)"
                icon="el-icon-edit"
                >编辑</el-button
              >
              <el-button
                size="mini"
                type="warning"
                @click="handleResetPassword(scope.row)"
                icon="el-icon-refresh"
                >重置密码</el-button
              >
              <el-button
                size="mini"
                type="danger"
                @click="handleDelete(scope.$index, scope.row)"
                icon="el-icon-delete"
                :disabled="scope.row.id === currentUser.id"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
          v-if="!isSearching"
          background
          layout="prev, pager, next, total"
          :total="pagination.total"
          :page-size="pagination.pageSize"
          :current-page="pagination.page"
          @current-change="handlePageChange"
          style="margin-top: 20px"
        >
        </el-pagination>

        <!-- 搜索结果提示 -->
        <div
          v-if="isSearching"
          style="margin-top: 20px; text-align: center; color: #909399"
        >
          共找到 {{ tableData.length }} 条搜索结果
        </div>

        <!-- 添加/编辑用户对话框 -->
        <el-dialog
          :title="dialogTitle"
          :visible.sync="dialogFormVisible"
          width="500px"
        >
          <el-form :model="form" :rules="rules" ref="userForm">
            <el-form-item
              label="用户名"
              :label-width="formLabelWidth"
              prop="userName"
            >
              <el-input
                v-model="form.userName"
                autocomplete="off"
                placeholder="请输入用户名（至少4位）"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="密码"
              :label-width="formLabelWidth"
              prop="password"
            >
              <el-input
                v-model="form.password"
                type="password"
                autocomplete="off"
                :placeholder="
                  isEditMode ? '不修改请留空' : '请输入密码（至少8位）'
                "
                show-password
              ></el-input>
            </el-form-item>
            <el-form-item
              v-if="!isEditMode"
              label="确认密码"
              :label-width="formLabelWidth"
              prop="checkPassword"
            >
              <el-input
                v-model="form.checkPassword"
                type="password"
                autocomplete="off"
                placeholder="请再次输入密码"
                show-password
              ></el-input>
            </el-form-item>
            <el-form-item
              label="用户角色"
              :label-width="formLabelWidth"
              prop="userRole"
            >
              <el-select
                v-model="form.userRole"
                placeholder="请选择用户角色"
                style="width: 100%"
              >
                <el-option label="普通用户" :value="0"></el-option>
                <el-option label="管理员" :value="1"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button
              type="primary"
              @click="confirmSubmit"
              :loading="submitLoading"
              >确 定</el-button
            >
          </div>
        </el-dialog>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import {
  getUserList,
  addUser,
  updateUser,
  getUserById,
  deleteUser,
  searchUsers,
  resetPassword,
} from "@/api/user";

export default {
  data() {
    // 密码验证函数
    const validatePassword = (rule, value, callback) => {
      if (this.isEditMode) {
        if (value && value.length < 8) {
          callback(new Error("密码长度不能小于8位"));
        } else {
          callback();
        }
      } else {
        if (!value) {
          callback(new Error("请输入密码"));
        } else if (value.length < 8) {
          callback(new Error("密码长度不能小于8位"));
        } else {
          callback();
        }
      }
    };

    // 确认密码验证函数
    const validateCheckPassword = (rule, value, callback) => {
      if (this.isEditMode) {
        callback();
      } else {
        if (value === "") {
          callback(new Error("请再次输入密码"));
        } else if (value !== this.form.password) {
          callback(new Error("两次输入密码不一致"));
        } else {
          callback();
        }
      }
    };

    return {
      currentUser: {
        id: null,
        userName: "",
      },
      formInline: {
        user: "",
      },
      tableData: [],
      loading: false,
      submitLoading: false,
      dialogFormVisible: false,
      isSearching: false,
      isEditMode: false,
      dialogTitle: "添加用户",
      form: {
        id: null,
        userName: "",
        password: "",
        checkPassword: "",
        userRole: 0,
      },
      rules: {
        userName: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 4, message: "用户名长度不能小于4位", trigger: "blur" },
        ],
        password: [
          {
            validator: validatePassword,
            trigger: "blur",
          },
        ],
        checkPassword: [
          {
            validator: validateCheckPassword,
            trigger: "blur",
          },
        ],
        userRole: [
          { required: true, message: "请选择用户角色", trigger: "change" },
        ],
      },
      formLabelWidth: "120px",
      pagination: {
        page: 1,
        pageSize: 5,
        total: 0,
      },
      searchTimer: null,
    };
  },
  mounted() {
    this.loadUserList();
    this.loadCurrentUser();
  },
  methods: {
    loadCurrentUser() {
      const userInfo = localStorage.getItem("userInfo");
      if (userInfo) {
        this.currentUser = JSON.parse(userInfo);
      }
    },

    handleCommand(command) {
      if (command === "logout") {
        this.handleLogout();
      }
    },

    handleLogout() {
      this.$confirm("确定要退出登录吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("userInfo");
          this.$message.success("已退出登录");
          this.$router.push("/login");
        })
        .catch(() => {});
    },

    async loadUserList() {
      this.loading = true;
      try {
        const res = await getUserList({
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
        });

        // 验证数据格式
        if (res.data && Array.isArray(res.data.rows)) {
          this.tableData = res.data.rows;
          this.pagination.total = res.data.total || 0;
        } else {
          this.tableData = [];
          this.pagination.total = 0;
          console.warn("返回数据格式异常:", res.data);
        }
      } catch (error) {
        console.error("加载失败：", error);
        this.$message.error("加载用户列表失败");
        this.tableData = [];
        this.pagination.total = 0;
      } finally {
        this.loading = false;
      }
    },

    handlePageChange(page) {
      this.pagination.page = page;
      this.loadUserList();
    },

    async onSubmit() {
      if (!this.formInline.user.trim()) {
        this.resetSearch();
        return;
      }

      // 防抖处理，避免频繁请求
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }

      this.searchTimer = setTimeout(async () => {
        this.loading = true;
        this.isSearching = true;
        try {
          const res = await searchUsers(this.formInline.user.trim());

          if (res.data && Array.isArray(res.data)) {
            this.tableData = res.data;
            if (res.data.length > 0) {
              this.$message.success(`找到 ${res.data.length} 条结果`);
            } else {
              this.$message.info("未找到匹配的用户");
            }
          } else {
            this.tableData = [];
            this.$message.info("未找到匹配的用户");
          }
        } catch (error) {
          console.error("查询失败：", error);
          this.$message.error("查询失败");
        } finally {
          this.loading = false;
        }
      }, 500);
    },

    resetSearch() {
      this.isSearching = false;
      this.formInline.user = "";
      this.pagination.page = 1;
      this.loadUserList();
    },

    onAddNewUser() {
      this.isEditMode = false;
      this.dialogTitle = "添加用户";
      this.form = {
        id: null,
        userName: "",
        password: "",
        checkPassword: "",
        userRole: 0,
      };
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs.userForm && this.$refs.userForm.clearValidate();
      });
    },

    async handleEdit(index, row) {
      this.isEditMode = true;
      this.dialogTitle = "编辑用户";

      try {
        const res = await getUserById(row.id);
        this.form = {
          id: res.data.id,
          userName: res.data.userName,
          password: "",
          checkPassword: "",
          userRole: res.data.userRole,
        };
        this.dialogFormVisible = true;
        this.$nextTick(() => {
          this.$refs.userForm && this.$refs.userForm.clearValidate();
        });
      } catch (error) {
        console.error("获取用户信息失败：", error);
        this.$message.error("获取用户信息失败");
      }
    },

    confirmSubmit() {
      this.$refs.userForm.validate(async (valid) => {
        if (!valid) {
          return false;
        }

        this.submitLoading = true;
        try {
          if (this.isEditMode) {
            await updateUser({
              id: this.form.id,
              userName: this.form.userName,
              userPassword: this.form.password || undefined, // 密码为空时不更新
              userRole: this.form.userRole,
            });
            this.$message.success("更新成功");
          } else {
            await addUser({
              userName: this.form.userName,
              userPassword: this.form.password,
              checkPassword: this.form.checkPassword,
              userRole: this.form.userRole,
            });
            this.$message.success("添加成功");
          }

          this.dialogFormVisible = false;

          if (this.isSearching) {
            this.resetSearch();
          } else {
            this.loadUserList();
          }
        } catch (error) {
          console.error("操作失败：", error);
          const errorMsg = error.response?.data?.message || "操作失败";
          this.$message.error(errorMsg);
        } finally {
          this.submitLoading = false;
        }
      });
    },

    async handleResetPassword(row) {
      try {
        await this.$confirm(
          `确定要将用户 "${row.userName}" 的密码重置为 "123456" 吗？`,
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        );

        await resetPassword(row.id);
        this.$message.success("密码已重置为：123456");
      } catch (error) {
        if (error !== "cancel") {
          console.error("重置失败：", error);
          this.$message.error("重置密码失败");
        }
      }
    },

    async handleDelete(index, row) {
      // 检查是否删除自己
      if (row.id === this.currentUser.id) {
        this.$message.warning("不能删除自己的账户");
        return;
      }

      try {
        await this.$confirm(`确定要删除用户 "${row.userName}" 吗？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });

        await deleteUser(row.id);
        this.$message.success("删除成功");

        if (this.isSearching) {
          this.onSubmit();
        } else {
          this.loadUserList();
        }
      } catch (error) {
        if (error !== "cancel") {
          console.error("删除失败：", error);
          this.$message.error("删除失败");
        }
      }
    },

    formatDate(dateString) {
      if (!dateString) return "-";
      const date = new Date(dateString);
      return date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    },
  },
};
</script>

<style scoped>
.el-header {
  background-color: #b3c0d1;
  color: #333;
}

.el-aside {
  background-color: #d3dce6;
  color: #333;
}

.el-main {
  background-color: #e9eef3;
  color: #333;
  text-align: left;
}

.demo-form-inline {
  white-space: nowrap;
}

.demo-form-inline :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 15px;
}

.demo-form-inline :deep(.el-form-item__label) {
  width: auto;
}

.demo-form-inline :deep(.el-form-item__content) {
  display: inline-flex;
  align-items: center;
}

/* 路由链接样式 */
.router-link {
  text-decoration: none;
  color: inherit;
  display: block;
  width: 100%;
  height: 100%;
}

.el-menu-item a {
  text-decoration: none;
  color: inherit;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .demo-form-inline :deep(.el-form-item) {
    margin-right: 10px;
    margin-bottom: 10px;
  }

  .el-table-column {
    min-width: 100px;
  }

  .el-header {
    font-size: 28px !important;
    padding: 0 10px !important;
  }
}

/* 下拉菜单样式优化 */
.el-dropdown-link {
  display: flex;
  align-items: center;
}

/* 表格操作按钮间距 */
.el-table .el-button {
  margin: 2px;
}
</style>
