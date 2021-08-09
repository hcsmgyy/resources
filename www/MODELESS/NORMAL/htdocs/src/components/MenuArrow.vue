<template>
<div>
    <my-icon
      id="down"
      type="iconarrowdown"
      :style="{ fontSize: '30px',position:'absolute',left:'275px',top:'28%'}"
    ></my-icon>
    <my-icon
      id="up"
      type="iconarrowup"
      :style="{ fontSize: '30px',position:'absolute',left:'275px',top:'28%'}"
    ></my-icon>
</div>
</template>

<style>
.ant-menu-submenu-open > div > span > div > #down {
  display: none !important;
}

.ant-menu-submenu-inline > div > span > div > #down {
  display: "";
}
.ant-menu-submenu-open > div > span > div > #up {
  display: block !important;
}
.ant-menu-submenu-inline > div > span > div > #up {
  display: none ;
}

</style>