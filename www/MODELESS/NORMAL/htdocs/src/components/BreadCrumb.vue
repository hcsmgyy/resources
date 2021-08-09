<template>
  <div :style="{marginLeft:'34px'}">
    <a-breadcrumb separator :style="{fontSize:'18px',marginBottom:'15px'}">
      <a-breadcrumb-item href>
        {{firstTitle}}
        <a-icon type="double-right" :style="{marginRight:'8px'}" />
      </a-breadcrumb-item>
      <a-breadcrumb-item href>{{secondTitle}}</a-breadcrumb-item>
    </a-breadcrumb>
  </div>
</template>

<script>
export default {
  props: {
    firstTitle: String,
    secondTitle: String,
  },
};
</script>