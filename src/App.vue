<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<script>
// import UserView from "./views/element/UserView.vue";

//import element view组件;
// import ElementView from "./views/element/ElementView.vue";
export default {
  // components: { QuestionView },
  data() {
    return {
      message: "hello vue",
    };
  },
  methods: {},
};
</script>

<style>
h1 {
  color: red;
}
</style>
