<template>
  <div class="ak-conetnt-title">
    <label>{{title}}</label>
    <Popover :descriptionContent="descriptionContent" :style="{paddingLeft:'15px'}"></Popover>
    <a-button type="primary" class="ak-content-title-btn" v-if="showExample" @click="openModal">
      {{$t("Example")}}
      <CommonModal :data="modalData"></CommonModal>
    </a-button>
  </div>
</template>

<script>
import Popover from "@/components/Popover.vue";
import CommonModal from "@/components/CommonModal.vue";
export default {
  components: {
    Popover,
    CommonModal,
  },
  props: {
    title: String,
    descriptionContent: String,
    showHint: { type: Boolean, default: true },
    showExample: { type: Boolean, default: false },
    imgName: String,
  },
  methods: {
    openModal: function () {
      this.modalData.visible = true;
    },
  },
  watch: {
    imgName(newval, oldval) {
      this.modalData.items[0].imgName = newval;
    },
  },
  data() {
    return {
      modalData: {
        title: " ",
        visible: false,
        items: [
          {
            type: "image",
            imgName: this.imgName,
          },
        ],
      },
    };
  },
};
</script>

<style scoped>
.ak-conetnt-title {
  display: flex;
  color: #343434;
  font-weight: bold;
  font-size: 18px;
  margin-left: 15px;
  margin-right: 15px;
  padding-bottom: 15px;
  padding-top: 15px;
  padding-left: 7px;
  border-bottom: solid 1px #d4dbe1;
  position: relative;
}

.ak-content-title-btn {
  width: 110px;
  color: #ffffff;
  font-size: 16px;
  margin-left: auto;
  margin-right: 20px;
}
</style>