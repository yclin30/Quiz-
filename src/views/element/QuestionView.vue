<template>
  <el-container style="height: 100vh">
    <el-header
      style="
        font-size: 40px;
        background-color: rgb(238, 241, 246);
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      Quiz后台管理
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
                <div slot="reference" class="name-wrapper">
                  <el-tag size="medium">{{
                    truncate(scope.row.questionText, 25)
                  }}</el-tag>
                </div>
              </el-popover>
            </template>
          </el-table-column>

          <!-- 选项A -->
          <el-table-column label="选项A" width="130">
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.answer1Correct ? 'success' : 'info'"
                size="small"
              >
                {{ truncate(scope.row.answer1Text, 12) }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 选项B -->
          <el-table-column label="选项B" width="130">
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.answer2Correct ? 'success' : 'info'"
                size="small"
              >
                {{ truncate(scope.row.answer2Text, 12) }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 选项C -->
          <el-table-column label="选项C" width="130">
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.answer3Correct ? 'success' : 'info'"
                size="small"
              >
                {{ truncate(scope.row.answer3Text, 12) }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 选项D -->
          <el-table-column label="选项D" width="130">
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.answer4Correct ? 'success' : 'info'"
                size="small"
              >
                {{ truncate(scope.row.answer4Text, 12) }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 正确答案 -->
          <el-table-column label="答案" width="70" align="center">
            <template slot-scope="scope">
              <el-tag type="success" size="medium">{{
                getCorrectAnswer(scope.row)
              }}</el-tag>
            </template>
          </el-table-column>

          <!-- 操作 -->
          <el-table-column label="操作" width="180">
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

        <!-- 添加题目对话框 -->
        <el-dialog
          title="添加题目"
          :visible.sync="dialogFormVisible"
          width="600px"
        >
          <el-form :model="form" :rules="rules" ref="questionForm">
            <el-form-item
              label="题目"
              :label-width="formLabelWidth"
              prop="question"
            >
              <el-input
                v-model="form.question"
                autocomplete="off"
                placeholder="请输入题目内容"
                type="textarea"
                :rows="3"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="选项A"
              :label-width="formLabelWidth"
              prop="optiona"
            >
              <el-input
                v-model="form.optiona"
                autocomplete="off"
                placeholder="请输入选项A"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="选项B"
              :label-width="formLabelWidth"
              prop="optionb"
            >
              <el-input
                v-model="form.optionb"
                autocomplete="off"
                placeholder="请输入选项B"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="选项C"
              :label-width="formLabelWidth"
              prop="optionc"
            >
              <el-input
                v-model="form.optionc"
                autocomplete="off"
                placeholder="请输入选项C"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="选项D"
              :label-width="formLabelWidth"
              prop="optiond"
            >
              <el-input
                v-model="form.optiond"
                autocomplete="off"
                placeholder="请输入选项D"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="正确答案"
              :label-width="formLabelWidth"
              prop="answer"
            >
              <el-select
                v-model="form.answer"
                placeholder="请选择正确答案"
                style="width: 100%"
              >
                <el-option label="A" value="a"></el-option>
                <el-option label="B" value="b"></el-option>
                <el-option label="C" value="c"></el-option>
                <el-option label="D" value="d"></el-option>
              </el-select>
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
import {
  getQuestionList,
  addQuestion,
  deleteQuestion,
  searchQuestion,
} from "@/api/question";

export default {
  data() {
    return {
      formInline: {
        question: "",
      },
      tableData: [],
      loading: false,
      submitLoading: false,
      dialogFormVisible: false,
      isSearching: false, // 是否在搜索模式
      form: {
        question: "",
        optiona: "",
        optionb: "",
        optionc: "",
        optiond: "",
        answer: "",
      },
      rules: {
        question: [{ required: true, message: "请输入题目", trigger: "blur" }],
        optiona: [{ required: true, message: "请输入选项A", trigger: "blur" }],
        optionb: [{ required: true, message: "请输入选项B", trigger: "blur" }],
        optionc: [{ required: true, message: "请输入选项C", trigger: "blur" }],
        optiond: [{ required: true, message: "请输入选项D", trigger: "blur" }],
        answer: [
          { required: true, message: "请选择正确答案", trigger: "change" },
        ],
      },
      formLabelWidth: "120px",
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
      },
    };
  },
  mounted() {
    this.loadQuestionList();
  },
  methods: {
    // 加载题目列表
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

    // 分页切换
    handlePageChange(page) {
      this.pagination.page = page;
      this.loadQuestionList();
    },

    // 查询题目
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

    // 重置搜索，返回列表
    resetSearch() {
      this.isSearching = false;
      this.formInline.question = "";
      this.pagination.page = 1;
      this.loadQuestionList();
    },

    // 打开添加对话框
    onAddNewQuestion() {
      this.form = {
        question: "",
        optiona: "",
        optionb: "",
        optionc: "",
        optiond: "",
        answer: "",
      };
      this.dialogFormVisible = true;
      // 清除表单验证
      this.$nextTick(() => {
        this.$refs.questionForm && this.$refs.questionForm.clearValidate();
      });
    },

    // 确认添加题目
    confirmAdd() {
      this.$refs.questionForm.validate(async (valid) => {
        if (!valid) {
          return false;
        }

        this.submitLoading = true;
        try {
          await addQuestion(this.form);
          this.$message.success("添加成功");
          this.dialogFormVisible = false;

          // 如果在搜索模式，返回列表
          if (this.isSearching) {
            this.resetSearch();
          } else {
            this.loadQuestionList();
          }
        } catch (error) {
          console.error("添加失败：", error);
        } finally {
          this.submitLoading = false;
        }
      });
    },

    // 编辑题目
    handleEdit(index, row) {
      this.$message.info(`编辑功能待实现，题目ID: ${row.id}`);
    },

    // 删除题目
    async handleDelete(index, row) {
      this.$confirm(
        `确定要删除题目 "${this.truncate(row.questionText, 20)}" 吗？`,
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(async () => {
          try {
            await deleteQuestion(row.id);
            this.$message.success("删除成功");

            // 如果在搜索模式，刷新搜索结果
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

    // 获取正确答案（A/B/C/D）
    getCorrectAnswer(row) {
      if (row.answer1Correct) return "A";
      if (row.answer2Correct) return "B";
      if (row.answer3Correct) return "C";
      if (row.answer4Correct) return "D";
      return "-";
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
