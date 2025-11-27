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
          <el-form-item label="题目关键词">
            <el-input
              v-model="formInline.question"
              placeholder="请输入题目关键词"
              style="width: 200px"
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
            <el-button
              type="success"
              @click="onAddNewQuestion"
              icon="el-icon-plus"
              >添加题目</el-button
            >
          </el-form-item>
        </el-form>

        <!-- 题目表格 -->
        <el-table :data="tableData" style="width: 100%" v-loading="loading">
          <el-table-column label="ID" width="60">
            <template slot-scope="scope">
              <span>{{ scope.row.id }}</span>
            </template>
          </el-table-column>

          <el-table-column label="题干" width="250">
            <template slot-scope="scope">
              <el-popover trigger="hover" placement="top" width="500">
                <div style="line-height: 1.8">
                  <p style="margin: 5px 0">
                    <strong>题目：</strong> {{ scope.row.questionText }}
                  </p>
                  <p style="margin: 5px 0">
                    <strong>A:</strong> {{ scope.row.answer1Text }}
                    {{ scope.row.answer1Correct ? "✅" : "" }}
                  </p>
                  <p style="margin: 5px 0">
                    <strong>B:</strong> {{ scope.row.answer2Text }}
                    {{ scope.row.answer2Correct ? "✅" : "" }}
                  </p>
                  <p style="margin: 5px 0">
                    <strong>C:</strong> {{ scope.row.answer3Text }}
                    {{ scope.row.answer3Correct ? "✅" : "" }}
                  </p>
                  <p style="margin: 5px 0">
                    <strong>D:</strong> {{ scope.row.answer4Text }}
                    {{ scope.row.answer4Correct ? "✅" : "" }}
                  </p>
                </div>
                <div slot="reference" style="cursor: pointer">
                  <el-tag type="success">{{
                    truncate(scope.row.questionText, 30)
                  }}</el-tag>
                </div>
              </el-popover>
            </template>
          </el-table-column>

          <el-table-column label="选项A" width="150">
            <template slot-scope="scope">
              {{ truncate(scope.row.answer1Text, 15) }}
              <el-tag v-if="scope.row.answer1Correct" type="success" size="mini"
                >✓</el-tag
              >
            </template>
          </el-table-column>

          <el-table-column label="选项B" width="150">
            <template slot-scope="scope">
              {{ truncate(scope.row.answer2Text, 15) }}
              <el-tag v-if="scope.row.answer2Correct" type="success" size="mini"
                >✓</el-tag
              >
            </template>
          </el-table-column>

          <el-table-column label="选项C" width="150">
            <template slot-scope="scope">
              {{ truncate(scope.row.answer3Text, 15) }}
              <el-tag v-if="scope.row.answer3Correct" type="success" size="mini"
                >✓</el-tag
              >
            </template>
          </el-table-column>

          <el-table-column label="选项D" width="150">
            <template slot-scope="scope">
              {{ truncate(scope.row.answer4Text, 15) }}
              <el-tag v-if="scope.row.answer4Correct" type="success" size="mini"
                >✓</el-tag
              >
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200">
            <template slot-scope="scope">
              <el-button
                size="mini"
                @click="handleEdit(scope.row)"
                icon="el-icon-edit"
                >编辑</el-button
              >
              <el-button
                size="mini"
                type="danger"
                @click="handleDelete(scope.row)"
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

        <!-- 添加/编辑题目对话框 -->
        <el-dialog
          :title="dialogTitle"
          :visible.sync="dialogFormVisible"
          width="700px"
        >
          <el-form
            :model="form"
            :rules="rules"
            ref="questionForm"
            label-width="100px"
          >
            <el-form-item label="题目" prop="questionText">
              <el-input
                type="textarea"
                v-model="form.questionText"
                placeholder="请输入题目内容"
                :rows="3"
              ></el-input>
            </el-form-item>

            <el-form-item label="选项 A" prop="answer1Text">
              <el-input
                v-model="form.answer1Text"
                placeholder="请输入选项A内容"
              >
                <el-checkbox slot="append" v-model="form.answer1Correct"
                  >正确答案</el-checkbox
                >
              </el-input>
            </el-form-item>

            <el-form-item label="选项 B" prop="answer2Text">
              <el-input
                v-model="form.answer2Text"
                placeholder="请输入选项B内容"
              >
                <el-checkbox slot="append" v-model="form.answer2Correct"
                  >正确答案</el-checkbox
                >
              </el-input>
            </el-form-item>

            <el-form-item label="选项 C" prop="answer3Text">
              <el-input
                v-model="form.answer3Text"
                placeholder="请输入选项C内容"
              >
                <el-checkbox slot="append" v-model="form.answer3Correct"
                  >正确答案</el-checkbox
                >
              </el-input>
            </el-form-item>

            <el-form-item label="选项 D" prop="answer4Text">
              <el-input
                v-model="form.answer4Text"
                placeholder="请输入选项D内容"
              >
                <el-checkbox slot="append" v-model="form.answer4Correct"
                  >正确答案</el-checkbox
                >
              </el-input>
            </el-form-item>

            <el-alert
              title="提示：至少选择一个正确答案"
              type="info"
              :closable="false"
              style="margin-bottom: 10px"
            ></el-alert>
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
  getQuestionList,
  addQuestion,
  updateQuestion,
  getQuestionById,
  deleteQuestion,
  searchQuestion,
} from "@/api/question";

export default {
  data() {
    return {
      currentUser: {
        userName: "",
      },
      formInline: {
        question: "",
      },
      tableData: [],
      loading: false,
      submitLoading: false,
      dialogFormVisible: false,
      isSearching: false,
      isEditMode: false,
      dialogTitle: "添加题目",
      form: {
        id: null,
        questionText: "",
        answer1Text: "",
        answer1Correct: false,
        answer2Text: "",
        answer2Correct: false,
        answer3Text: "",
        answer3Correct: false,
        answer4Text: "",
        answer4Correct: false,
      },
      rules: {
        questionText: [
          { required: true, message: "请输入题目内容", trigger: "blur" },
          { min: 5, message: "题目内容不能少于5个字符", trigger: "blur" },
        ],
        answer1Text: [
          { required: true, message: "请输入选项A内容", trigger: "blur" },
        ],
        answer2Text: [
          { required: true, message: "请输入选项B内容", trigger: "blur" },
        ],
        answer3Text: [
          { required: true, message: "请输入选项C内容", trigger: "blur" },
        ],
        answer4Text: [
          { required: true, message: "请输入选项D内容", trigger: "blur" },
        ],
      },
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
      },
    };
  },
  mounted() {
    this.loadQuestionList();
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

    async loadQuestionList() {
      this.loading = true;
      try {
        const res = await getQuestionList({
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
        });

        this.tableData = res.data.rows || [];
        this.pagination.total = res.data.total || 0;
      } catch (error) {
        console.error("加载失败：", error);
        this.$message.error("加载题目列表失败");
      } finally {
        this.loading = false;
      }
    },

    handlePageChange(page) {
      this.pagination.page = page;
      this.loadQuestionList();
    },

    async onSubmit() {
      if (!this.formInline.question.trim()) {
        this.resetSearch();
        return;
      }

      this.loading = true;
      this.isSearching = true;
      try {
        const res = await searchQuestion(this.formInline.question);

        if (res.data && Array.isArray(res.data)) {
          this.tableData = res.data;
          if (res.data.length > 0) {
            this.$message.success(`找到 ${res.data.length} 条结果`);
          } else {
            this.$message.info("未找到匹配的题目");
          }
        } else {
          this.tableData = [];
          this.$message.info("未找到匹配的题目");
        }
      } catch (error) {
        console.error("查询失败：", error);
        this.$message.error("查询失败");
      } finally {
        this.loading = false;
      }
    },

    resetSearch() {
      this.isSearching = false;
      this.formInline.question = "";
      this.pagination.page = 1;
      this.loadQuestionList();
    },

    onAddNewQuestion() {
      this.isEditMode = false;
      this.dialogTitle = "添加题目";
      this.form = {
        id: null,
        questionText: "",
        answer1Text: "",
        answer1Correct: false,
        answer2Text: "",
        answer2Correct: false,
        answer3Text: "",
        answer3Correct: false,
        answer4Text: "",
        answer4Correct: false,
      };
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs.questionForm && this.$refs.questionForm.clearValidate();
      });
    },

    async handleEdit(row) {
      this.isEditMode = true;
      this.dialogTitle = "编辑题目";

      try {
        const res = await getQuestionById(row.id);
        this.form = {
          id: res.data.id,
          questionText: res.data.questionText,
          answer1Text: res.data.answer1Text,
          answer1Correct: res.data.answer1Correct,
          answer2Text: res.data.answer2Text,
          answer2Correct: res.data.answer2Correct,
          answer3Text: res.data.answer3Text,
          answer3Correct: res.data.answer3Correct,
          answer4Text: res.data.answer4Text,
          answer4Correct: res.data.answer4Correct,
        };
        this.dialogFormVisible = true;
        this.$nextTick(() => {
          this.$refs.questionForm && this.$refs.questionForm.clearValidate();
        });
      } catch (error) {
        console.error("获取题目信息失败：", error);
        this.$message.error("获取题目信息失败");
      }
    },

    confirmSubmit() {
      this.$refs.questionForm.validate(async (valid) => {
        if (!valid) {
          return false;
        }

        // 验证至少有一个正确答案
        const hasCorrectAnswer =
          this.form.answer1Correct ||
          this.form.answer2Correct ||
          this.form.answer3Correct ||
          this.form.answer4Correct;

        if (!hasCorrectAnswer) {
          this.$message.error("请至少选择一个正确答案");
          return false;
        }

        this.submitLoading = true;
        try {
          if (this.isEditMode) {
            // 编辑题目
            await updateQuestion(this.form);
            this.$message.success("更新成功");
          } else {
            // 添加题目（需要转换格式）
            await addQuestion({
              question: this.form.questionText,
              optiona: this.form.answer1Text,
              optionb: this.form.answer2Text,
              optionc: this.form.answer3Text,
              optiond: this.form.answer4Text,
              answer: this.getCorrectAnswerLetter(),
            });
            this.$message.success("添加成功");
          }

          this.dialogFormVisible = false;

          if (this.isSearching) {
            this.resetSearch();
          } else {
            this.loadQuestionList();
          }
        } catch (error) {
          console.error("操作失败：", error);
        } finally {
          this.submitLoading = false;
        }
      });
    },

    // 获取正确答案的字母（用于添加题目）
    getCorrectAnswerLetter() {
      const answers = [];
      if (this.form.answer1Correct) answers.push("a");
      if (this.form.answer2Correct) answers.push("b");
      if (this.form.answer3Correct) answers.push("c");
      if (this.form.answer4Correct) answers.push("d");
      return answers.join(",");
    },

    async handleDelete(row) {
      this.$confirm(`确定要删除这道题目吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          try {
            await deleteQuestion(row.id);
            this.$message.success("删除成功");

            if (this.isSearching) {
              this.onSubmit();
            } else {
              this.loadQuestionList();
            }
          } catch (error) {
            console.error("删除失败：", error);
            this.$message.error("删除失败");
          }
        })
        .catch(() => {});
    },

    // 截断文本
    truncate(text, length) {
      if (!text) return "";
      return text.length > length ? text.substring(0, length) + "..." : text;
    },
  },
};
</script>

<style scoped>
. el-header {
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
