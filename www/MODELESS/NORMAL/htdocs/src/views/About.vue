<template>

<label>我是about</label>
</template>

<script>
// @ is an alias to /src
import Top from "@/components/Top.vue";
import Left from "@/components/Left.vue";

export default {
  name: "App",
  components: {
    Top,
    Left,
  },
  data() {
    return {
      model: "C317",
      showLeft:false
    };
  },
  methods: {
    test: function () {
      this.$i18n.locale = "ch";
    },
  },
};
</script>