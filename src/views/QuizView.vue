<template>
  <div class="quiz-page">
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

    <!-- 答题内容区域 -->
    <div class="quiz-container">
      <!-- 开始屏幕 -->
      <el-card v-if="currentScreen === 'start'" class="screen-card">
        <div class="start-content">
          <h1>Quiz Time</h1>
          <p>准备好测试你的知识了吗？</p>
          <el-button
            type="primary"
            size="large"
            @click="startQuiz"
            :loading="loading"
          >
            开始答题
          </el-button>
        </div>
      </el-card>

      <!-- 答题屏幕 -->
      <el-card
        v-if="currentScreen === 'quiz'"
        class="screen-card"
        v-loading="loading"
      >
        <div class="quiz-header">
          <h2 class="question-text">{{ currentQuestion.questionText }}</h2>
          <div class="quiz-info">
            <span>题目 {{ currentIndex + 1 }} / {{ questions.length }}</span>
            <span>得分: {{ score }}</span>
          </div>
        </div>

        <div class="answers-container">
          <el-button
            v-for="(answer, index) in currentAnswers"
            :key="index"
            :class="getAnswerClass(answer.key)"
            :disabled="answersDisabled"
            @click="selectAnswer(answer.key)"
            class="answer-btn"
          >
            {{ answer.key }}. {{ answer.text }}
          </el-button>
        </div>

        <div class="progress-bar">
          <div class="progress" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </el-card>

      <!-- 结果屏幕 -->
      <el-card v-if="currentScreen === 'result'" class="screen-card">
        <div class="result-content">
          <h1>答题完成！</h1>
          <div class="result-info">
            <div class="result-item">
              <span class="label">总题数：</span>
              <span class="value">{{ result.totalQuestions }}</span>
            </div>
            <div class="result-item">
              <span class="label">正确：</span>
              <span class="value correct">{{ result.correctCount }} 题</span>
            </div>
            <div class="result-item">
              <span class="label">错误：</span>
              <span class="value wrong">{{ result.wrongCount }} 题</span>
            </div>
            <div class="result-item">
              <span class="label">得分：</span>
              <span class="value score">{{ result.score.toFixed(1) }} 分</span>
            </div>
          </div>
          <div class="result-message">
            <p>{{ resultMessage }}</p>
          </div>
          <div class="button-group">
            <el-button type="primary" @click="viewDetails">查看详情</el-button>
            <el-button @click="restartQuiz">再做一次</el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { getRandomQuestions, submitQuiz } from "@/api/quiz";

export default {
  name: "QuizView",
  data() {
    return {
      currentUser: {
        userName: "",
      },
      currentScreen: "start",
      questions: [],
      currentIndex: 0,
      score: 0,
      userAnswers: {},
      answersDisabled: false,
      selectedAnswer: null,
      loading: false,
      result: null,
      recordId: null,
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentIndex] || {};
    },
    currentAnswers() {
      const q = this.currentQuestion;
      return [
        { key: "A", text: q.answer1Text, correct: q.answer1Correct },
        { key: "B", text: q.answer2Text, correct: q.answer2Correct },
        { key: "C", text: q.answer3Text, correct: q.answer3Correct },
        { key: "D", text: q.answer4Text, correct: q.answer4Correct },
      ];
    },
    progressPercent() {
      return ((this.currentIndex + 1) / this.questions.length) * 100;
    },
    resultMessage() {
      if (!this.result) return "";
      const percentage = this.result.score;
      if (percentage === 100) return "完美！你是天才！🎉";
      if (percentage >= 80) return "太棒了！你很厉害！👏";
      if (percentage >= 60) return "不错的成绩！继续加油！💪";
      if (percentage >= 40) return "还不错！再努力一下！📚";
      return "继续学习，你会进步的！🌟";
    },
  },
  mounted() {
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

    async startQuiz() {
      this.loading = true;
      try {
        const res = await getRandomQuestions(10);
        this.questions = res.data || [];

        if (this.questions.length === 0) {
          this.$message.error("题库中没有题目");
          return;
        }

        this.currentIndex = 0;
        this.score = 0;
        this.userAnswers = {};
        this.currentScreen = "quiz";
      } catch (error) {
        console.error("加载题目失败：", error);
        this.$message.error("加载题目失败");
      } finally {
        this.loading = false;
      }
    },

    selectAnswer(answerKey) {
      if (this.answersDisabled) return;

      this.answersDisabled = true;
      this.selectedAnswer = answerKey;
      this.userAnswers[this.currentIndex] = answerKey;

      const correctAnswer = this.currentAnswers.find(
        (a) => a.key === answerKey && a.correct
      );
      if (correctAnswer) {
        this.score++;
      }

      setTimeout(() => {
        this.answersDisabled = false;
        this.selectedAnswer = null;
        this.currentIndex++;

        if (this.currentIndex >= this.questions.length) {
          this.submitQuizAnswers();
        }
      }, 1000);
    },

    getAnswerClass(answerKey) {
      if (!this.answersDisabled) return "";

      const answer = this.currentAnswers.find((a) => a.key === answerKey);
      if (answer.correct) {
        return "correct";
      }
      if (this.selectedAnswer === answerKey && !answer.correct) {
        return "incorrect";
      }
      return "";
    },

    async submitQuizAnswers() {
      this.loading = true;
      try {
        const answers = this.questions.map((q, index) => ({
          questionId: q.id,
          userAnswer: this.userAnswers[index] || "",
        }));

        const res = await submitQuiz({ answers });
        this.result = res.data;
        this.recordId = res.data.recordId;
        this.currentScreen = "result";
      } catch (error) {
        console.error("提交失败：", error);
        this.$message.error("提交失败");
      } finally {
        this.loading = false;
      }
    },

    viewDetails() {
      this.$router.push(`/quiz/result/${this.recordId}`);
    },

    restartQuiz() {
      this.currentScreen = "start";
      this.questions = [];
      this.currentIndex = 0;
      this.score = 0;
      this.userAnswers = {};
      this.result = null;
      this.recordId = null;
    },
  },
};
</script>

<style scoped>
.quiz-page {
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
  font-size: 1.5em;
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

.quiz-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.screen-card {
  width: 800px;
  max-width: 100%;
  min-height: 500px;
}

.start-content,
.result-content {
  text-align: center;
  padding: 40px 20px;
}

h1 {
  color: #e86a33;
  font-size: 2.5em;
  margin-bottom: 20px;
}

.start-content p {
  font-size: 1.2em;
  color: #666;
  margin-bottom: 30px;
}

.quiz-header {
  margin-bottom: 30px;
}

.question-text {
  font-size: 1.5em;
  color: #333;
  margin-bottom: 20px;
  line-height: 1.6;
  text-align: left;
}

.quiz-info {
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 1.1em;
  padding: 10px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.answers-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.answer-btn {
  width: 100%;
  text-align: left;
  padding: 20px;
  font-size: 1.1em;
  border: 2px solid #e0e0e0;
  background-color: #f8f0e5;
  color: #333;
  transition: all 0.3s ease;
  height: auto;
  white-space: normal;
  line-height: 1.6;
}

.answer-btn:hover:not(:disabled) {
  background-color: #e86a33;
  color: white;
  border-color: #e86a33;
  transform: translateX(5px);
}

.answer-btn.correct {
  background-color: #4bb543;
  color: white;
  border-color: #4bb543;
}

.answer-btn.incorrect {
  background-color: #ff4d4d;
  color: white;
  border-color: #ff4d4d;
}

.progress-bar {
  height: 10px;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 20px;
}

.progress {
  height: 100%;
  background-color: #e86a33;
  transition: width 0.3s ease;
}

.result-info {
  margin: 30px 0;
  background-color: #f8f0e5;
  padding: 30px;
  border-radius: 10px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 1.3em;
  border-bottom: 1px solid #e0e0e0;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item .label {
  font-weight: bold;
  color: #666;
}

.result-item .value {
  font-weight: bold;
}

.result-item .value.correct {
  color: #4bb543;
}

.result-item .value.wrong {
  color: #ff4d4d;
}

.result-item .value.score {
  color: #e86a33;
  font-size: 1.2em;
}

.result-message {
  font-size: 1.8em;
  font-weight: bold;
  color: #e86a33;
  margin: 30px 0;
}

.button-group {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .site-title {
    font-size: 1.2em;
  }

  .screen-card {
    width: 100%;
  }

  h1 {
    font-size: 2em;
  }

  .question-text {
    font-size: 1.2em;
  }

  .answer-btn {
    font-size: 1em;
    padding: 15px;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group .el-button {
    width: 100%;
  }
}
</style>
