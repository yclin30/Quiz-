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
                <router-link to="/user">用户管理</router-link>
              </el-menu-item>
              <el-menu-item index="1-2">
                <router-link to="/question">题目管理</router-link>
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

          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                size="mini"
                @click="handleEdit(scope.$index, scope.row)"
                icon="el-icon-edit"
                >编辑</el-button
              >
              <el-button
                size="mini"
                type="danger"
                @click="handleDelete(scope.$index, scope.row)"
                icon="el-icon-delete"
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

        <!-- 添加用户对话框 -->
        <el-dialog title="添加用户" :visible.sync="dialogFormVisible">
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
                placeholder="请输入密码（至少8位）"
                show-password
              ></el-input>
            </el-form-item>
            <el-form-item
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
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button
              type="primary"
              @click="confirmAdd"
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
import { getUserList, register, deleteUser, searchUsers } from "@/api/user";

export default {
  data() {
    return {
      currentUser: {
        userName: "",
      },
      formInline: {
        user: "",
      },
      tableData: [],
      loading: false,
      submitLoading: false,
      dialogFormVisible: false,
      isSearching: false, // 是否在搜索模式
      form: {
        userName: "",
        password: "",
        checkPassword: "",
      },
      rules: {
        userName: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 4, message: "用户名长度不能小于4位", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 8, message: "密码长度不能小于8位", trigger: "blur" },
        ],
        checkPassword: [
          { required: true, message: "请再次输入密码", trigger: "blur" },
          { validator: this.validateCheckPassword, trigger: "blur" },
        ],
      },
      formLabelWidth: "120px",
      pagination: {
        page: 1,
        pageSize: 5,
        total: 0,
      },
    };
  },
  mounted() {
    this.loadUserList();
    this.loadCurrentUser();
  },
  methods: {
    // 验证确认密码
    validateCheckPassword(rule, value, callback) {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.form.password) {
        callback(new Error("两次输入密码不一致"));
      } else {
        callback();
      }
    },
    // 加载当前用户信息
    loadCurrentUser() {
      const userInfo = localStorage.getItem("userInfo");
      if (userInfo) {
        this.currentUser = JSON.parse(userInfo);
      }
    },

    // 处理下拉菜单命令
    handleCommand(command) {
      if (command === "logout") {
        this.handleLogout();
      }
    },

    // 退出登录
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

    // 加载用户列表
    async loadUserList() {
      this.loading = true;
      try {
        const res = await getUserList({
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
        });

        this.tableData = res.data.rows || [];
        this.pagination.total = res.data.total || 0;
      } catch (error) {
        console.error("加载失败：", error);
        this.$message.error("加载用户列表失败");
      } finally {
        this.loading = false;
      }
    },

    // 分页切换
    handlePageChange(page) {
      this.pagination.page = page;
      this.loadUserList();
    },

    // 查询用户
    async onSubmit() {
      if (!this.formInline.user.trim()) {
        this.resetSearch();
        return;
      }

      this.loading = true;
      this.isSearching = true;
      try {
        const res = await searchUsers(this.formInline.user);

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
    },

    // 重置搜索，返回列表
    resetSearch() {
      this.isSearching = false;
      this.formInline.user = "";
      this.pagination.page = 1;
      this.loadUserList();
    },

    // 打开添加对话框
    onAddNewUser() {
      this.form = {
        userName: "",
        password: "",
        checkPassword: "",
      };
      this.dialogFormVisible = true;
      // 清除表单验证
      this.$nextTick(() => {
        this.$refs.userForm && this.$refs.userForm.clearValidate();
      });
    },

    // 确认添加用户
    confirmAdd() {
      this.$refs.userForm.validate(async (valid) => {
        if (!valid) {
          return false;
        }

        this.submitLoading = true;
        try {
          await register({
            userName: this.form.userName,
            userPassword: this.form.password,
            checkPassword: this.form.checkPassword,
          });
          this.$message.success("添加成功");
          this.dialogFormVisible = false;

          // 如果在搜索模式，返回列表
          if (this.isSearching) {
            this.resetSearch();
          } else {
            this.loadUserList();
          }
        } catch (error) {
          console.error("添加失败：", error);
        } finally {
          this.submitLoading = false;
        }
      });
    },

    // 编辑用户
    handleEdit(index, row) {
      this.$message.info(`编辑功能待实现，用户ID: ${row.id}`);
    },

    // 删除用户
    async handleDelete(index, row) {
      this.$confirm(`确定要删除用户 "${row.userName}" 吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          try {
            await deleteUser(row.id);
            this.$message.success("删除成功");

            // 如果在搜索模式，刷新搜索结果
            if (this.isSearching) {
              this.onSubmit();
            } else {
              this.loadUserList();
            }
          } catch (error) {
            console.error("删除失败：", error);
            this.$message.error("删除失败");
          }
        })
        .catch(() => {});
    },

    // 格式化日期
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
</style>
