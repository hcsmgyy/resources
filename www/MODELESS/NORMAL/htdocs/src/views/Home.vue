<template>
  <div class="home">
    <a-button type="primary" @click="changeTheme('#992777')">默认</a-button>
    <br />
    <br />
    <a-button type="primary" @click="changeTheme('#F5222D')">薄暮</a-button>
    <br />
    <br />
    <a-button type="primary" @click="changeTheme('#FA541C')">火山</a-button>
    <br />
    <br />
    <a-button type="primary" @click="changeTheme('#FAAD14')">日暮</a-button>
    <br />
    <br />
    <a-button type="primary" @click="changeTheme('#13C2C2')">明青</a-button>
    <br />
    <br />
    <a-button type="primary" @click="changeTheme('#52C41A')">极光绿</a-button>
    <br />
    <br />
    <a-button type="primary" @click="changeTheme('#1890FF')">拂晓蓝</a-button>
    <br />
    <br />
    <a-button type="primary" @click="changeTheme('#2F54EB')">极客蓝</a-button>
    <br />
    <br />
    <a-button type="primary" @click="changeTheme('#722ED1')">酱紫</a-button>
    <br />
    <br />
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: "Home",
  components: {},
  methods: {
    changeTheme(primaryColor) {
      console.log("click change theme");
      window.less.modifyVars({
        "@primary-color": primaryColor,
        "@layout-header-background": primaryColor,
        "@ak-sider-bg": primaryColor,
      });
    },
  },
};
</script>
