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
        <!-- 顶部form表单 -->
        <el-form
          :inline="true"
          :model="formInline"
          class="demo-form-inline"
          style="margin-bottom: 20px"
        >
          <el-form-item label="题目序号">
            <el-input
              v-model="formInline.question"
              placeholder="请输入题目序号"
              style="width: 150px"
            ></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="onSubmit">查询</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="success" @click="onAddNewQuestion"
              >添加题目</el-button
            >
          </el-form-item>
        </el-form>
        <!-- 带编辑/删除操作选项的table项目 -->
        <el-table :data="tableData" style="width: 100%">
          <el-table-column label="序号" width="180">
            <template slot-scope="scope">
              <span style="margin-left: 10px">{{ scope.row.id }}</span>
            </template>
          </el-table-column>

          <el-table-column label="题干" width="180">
            <template slot-scope="scope">
              <el-popover trigger="hover" placement="top">
                <p>题干: {{ scope.row.question }}</p>
                <div slot="reference" class="name-wrapper">
                  <el-tag size="medium">{{ scope.row.question }}</el-tag>
                </div>
              </el-popover>
            </template>
          </el-table-column>

          <el-table-column label="选项" width="180">
            <template slot-scope="scope">
              <el-tag size="medium">{{ scope.row.optionA }}</el-tag>
              <el-tag size="medium">{{ scope.row.optionB }}</el-tag>
              <el-tag size="medium">{{ scope.row.optionC }}</el-tag>
              <el-tag size="medium">{{ scope.row.optionD }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="正确答案" width="180">
            <template slot-scope="scope">
              <el-tag size="medium">{{ scope.row.correctAnswer }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                size="mini"
                @click="handleEdit(scope.$index, scope.row)"
                >编辑</el-button
              >
              <el-button
                size="mini"
                type="danger"
                @click="handleDelete(scope.$index, scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页选项 -->
        <el-pagination background layout="prev, pager, next" :total="1000">
        </el-pagination>
        <!-- 用户的弹出对话框 -->
        <el-dialog title="添加题目" :visible.sync="dialogFormVisible">
          <el-form :model="form">
            <el-form-item label="题目" :label-width="formLabelWidth">
              <el-input v-model="form.question" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="选项A" :label-width="formLabelWidth">
              <el-input v-model="form.optionA" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="选项B" :label-width="formLabelWidth">
              <el-input v-model="form.optionB" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="选项C" :label-width="formLabelWidth">
              <el-input v-model="form.optionC" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="选项D" :label-width="formLabelWidth">
              <el-input v-model="form.optionD" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="正确答案" :label-width="formLabelWidth">
              <el-input
                v-model="form.correctAnswer"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="dialogFormVisible = false"
              >确 定</el-button
            >
          </div>
        </el-dialog>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      formInline: {
        user: "",
        region: "",
      },
      tableData: [
        {
          id: 1,
          question: "以下哪个选项是JavaScript的正确数据类型？",
          optionA: "字符串",
          optionB: "数字",
          optionC: "布尔值",
          optionD: "对象",
          correctAnswer: "A",
        },
        {
          id: 2,
          question: "以下哪个选项是Vue.js的核心概念？",
          optionA: "组件",
          optionB: "指令",
          optionC: "路由",
          optionD: "状态管理",
          correctAnswer: "A",
        },
        {
          id: 3,
          question: "以下哪个选项是HTML的正确标签？",
          optionA: "<div>",
          optionB: "<span>",
          optionC: "<p>",
          optionD: "<a>",
          correctAnswer: "A",
        },
        {
          id: 4,
          question: "以下哪个选项是CSS的正确选择器？",
          optionA: ".class",
          optionB: "#id",
          optionC: "element",
          optionD: "attribute",
          correctAnswer: "A",
        },
      ],
      search: "",
      gridData: [
        {
          date: "2016-05-02",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄",
        },
        {
          date: "2016-05-04",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄",
        },
        {
          date: "2016-05-01",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄",
        },
        {
          date: "2016-05-03",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄",
        },
      ],
      dialogTableVisible: false,
      dialogFormVisible: false,
      form: {
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "",
      },
      formLabelWidth: "120px",
    };
  },
  methods: {
    onAddNewQuestion() {
      console.log("add new question!");
      this.dialogFormVisible = true;
    },
    onSubmit() {
      console.log("submit!");
    },
    handleEdit(index, row) {
      console.log(index, row);
    },
    handleDelete(index, row) {
      console.log(index, row);
    },
  },
};
</script>

<style scoped>
.el-header {
  background-color: #b3c0d1;
  color: #333;
  /* 移除 line-height，使用 flex 布局居中 */
}

.el-aside {
  background-color: #d3dce6;
  color: #333;
  /* 移除 line-height */
}

.el-main {
  background-color: #e9eef3;
  color: #333;
  /* 移除 line-height 和 text-align */
  text-align: left; /* 改为左对齐 */
}

/* 为表单添加自定义样式 */
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
