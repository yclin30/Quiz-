<template>
  <div class="result-page">
    <!-- 顶部导航栏 -->
    <div class="top-header">
      <div class="header-content">
        <h2 class="site-title">Quiz 在线测试系统</h2>
        <div class="user-info">
          <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
              <i class="el-icon-user"></i>
              {{ currentUser.userName }}
              <i class="el-icon-arrow-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="logout">
                <i class="el-icon-switch-button"></i> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 结果详情内容 -->
    <div class="result-detail-container">
      <el-card class="result-card" v-loading="loading">
        <div slot="header" class="card-header">
          <h2>答题详情</h2>
          <el-button type="text" @click="goBack" icon="el-icon-back"
            >返回</el-button
          >
        </div>

        <!-- 总体统计 -->
        <div class="summary" v-if="record">
          <div class="summary-item">
            <span class="label">总题数：</span>
            <span class="value">{{ record.totalQuestions }}</span>
          </div>
          <div class="summary-item">
            <span class="label">正确：</span>
            <span class="value correct">{{ record.correctCount }} 题</span>
          </div>
          <div class="summary-item">
            <span class="label">错误：</span>
            <span class="value wrong">{{ record.wrongCount }} 题</span>
          </div>
          <div class="summary-item">
            <span class="label">得分：</span>
            <span class="value score">{{ record.score.toFixed(1) }} 分</span>
          </div>
          <div class="summary-item">
            <span class="label">答题时间：</span>
            <span class="value">{{ formatDate(record.createTime) }}</span>
          </div>
        </div>

        <!-- 题目详情列表 -->
        <div class="details-list">
          <div
            v-for="(detail, index) in details"
            :key="index"
            class="detail-item"
            :class="{ correct: detail.isCorrect, wrong: !detail.isCorrect }"
          >
            <div class="detail-header">
              <span class="question-number">第 {{ index + 1 }} 题</span>
              <el-tag
                :type="detail.isCorrect ? 'success' : 'danger'"
                size="small"
              >
                {{ detail.isCorrect ? "正确" : "错误" }}
              </el-tag>
            </div>

            <div class="question-content">
              <p class="question-text">{{ detail.question.questionText }}</p>

              <div class="options">
                <div
                  v-for="(option, optKey) in getOptions(detail.question)"
                  :key="optKey"
                  class="option"
                  :class="getOptionClass(detail, optKey)"
                >
                  <span class="option-label">{{ optKey }}. </span>
                  <span class="option-text">{{ option.text }}</span>
                  <el-tag
                    v-if="option.correct"
                    type="success"
                    size="mini"
                    class="correct-tag"
                  >
                    ✓ 正确答案
                  </el-tag>
                  <el-tag
                    v-if="detail.userAnswer === optKey && !option.correct"
                    type="danger"
                    size="mini"
                    class="wrong-tag"
                  >
                    ✗ 你的答案
                  </el-tag>
                </div>
              </div>

              <div class="answer-info">
                <span>你的答案：{{ detail.userAnswer || "未作答" }}</span>
                <span>正确答案：{{ detail.correctAnswers.join(", ") }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="footer-buttons">
          <el-button type="primary" @click="restartQuiz">再做一次</el-button>
          <el-button @click="goBack">返回</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { getQuizResult } from "@/api/quiz";

export default {
  name: "QuizResultView",
  data() {
    return {
      currentUser: {
        userName: "",
      },
      loading: false,
      record: null,
      details: [],
    };
  },
  mounted() {
    this.loadCurrentUser();
    this.loadResult();
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

    async loadResult() {
      const recordId = this.$route.params.recordId;
      if (!recordId) {
        this.$message.error("缺少答题记录ID");
        this.$router.push("/quiz");
        return;
      }

      this.loading = true;
      try {
        const res = await getQuizResult(recordId);
        this.record = res.data.record;
        this.details = res.data.details;
      } catch (error) {
        console.error("加载详情失败：", error);
        this.$message.error("加载详情失败");
      } finally {
        this.loading = false;
      }
    },

    getOptions(question) {
      return {
        A: { text: question.answer1Text, correct: question.answer1Correct },
        B: { text: question.answer2Text, correct: question.answer2Correct },
        C: { text: question.answer3Text, correct: question.answer3Correct },
        D: { text: question.answer4Text, correct: question.answer4Correct },
      };
    },

    getOptionClass(detail, optionKey) {
      const options = this.getOptions(detail.question);
      const isCorrectOption = options[optionKey].correct;
      const isUserAnswer = detail.userAnswer === optionKey;

      if (isCorrectOption) return "correct-option";
      if (isUserAnswer && !isCorrectOption) return "wrong-option";
      return "";
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
      });
    },

    restartQuiz() {
      this.$router.push("/quiz");
    },

    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
.result-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

.top-header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.site-title {
  margin: 0;
  color: #e86a33;
  font-size: 1 5em;
  font-weight: bold;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-dropdown {
  cursor: pointer;
  color: #333;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s;
}

.user-dropdown:hover {
  background-color: #f5f5f5;
}

.user-dropdown i {
  margin: 0 4px;
}

.result-detail-container {
  flex: 1;
  padding: 20px;
}

.result-card {
  max-width: 900px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  color: #333;
}

.summary {
  background-color: #f8f0e5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item .label {
  font-weight: bold;
  color: #666;
}

.summary-item .value {
  font-weight: bold;
  font-size: 1.1em;
}

.summary-item .value.correct {
  color: #4bb543;
}

.summary-item .value.wrong {
  color: #ff4d4d;
}

.summary-item .value.score {
  color: #e86a33;
  font-size: 1.3em;
}

.details-list {
  margin-bottom: 20px;
}

.detail-item {
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  background-color: #fff;
}

.detail-item.correct {
  border-color: #4bb543;
  background-color: #f0f9f0;
}

.detail-item.wrong {
  border-color: #ff4d4d;
  background-color: #fff5f5;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.question-number {
  font-weight: bold;
  font-size: 1.1em;
  color: #333;
}

.question-content {
  margin-top: 10px;
}

.question-text {
  font-size: 1.1em;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  line-height: 1.6;
}

.options {
  margin: 15px 0;
}

.option {
  padding: 12px;
  margin-bottom: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  background-color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
}

.option.correct-option {
  border-color: #4bb543;
  background-color: #f0f9f0;
}

.option.wrong-option {
  border-color: #ff4d4d;
  background-color: #fff5f5;
}

.option-label {
  font-weight: bold;
  min-width: 30px;
}

.option-text {
  flex: 1;
}

.correct-tag,
.wrong-tag {
  margin-left: auto;
}

.answer-info {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
  color: #666;
}

.footer-buttons {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.footer-buttons .el-button {
  margin: 0 10px;
}

@media (max-width: 768px) {
  .site-title {
    font-size: 1.2em;
  }

  .result-card {
    margin: 0;
  }

  .answer-info {
    flex-direction: column;
    gap: 10px;
  }

  .footer-buttons .el-button {
    width: 100%;
    margin: 5px 0;
  }
}
</style>
