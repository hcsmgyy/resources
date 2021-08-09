<template>
  <div class="ak-file-input-div">
    <label class="ak-file-input-title-label">{{labelTitle}}</label>
    <a-button type="primary" class="ak-file-input-btn" @click="openModal">
      <MyIcon type="iconimport" :style="{fontSize:'14px',paddingRight:'6px'}"></MyIcon>
      {{ importBtnName}}
    </a-button>
    <a-button
      v-show="isShowExport"
      type="primary"
      class="ak-file-input-btn"
      :style="{marginLeft: '20px'}"
      @click="onExport"
    >
      <MyIcon :type="exportBtnIcon" :style="{fontSize:'14px',paddingRight:'6px'}"></MyIcon>
      {{exportBtnName }}
    </a-button>
    <label class="ak-common-file-input-hint-label" v-if="showHint">{{hintContent}}</label>
    <Popover
      :showDescription="showDescription"
      :descriptionContent="descriptionContent"
      :style="{paddingLeft:'15px'}"
    ></Popover>
    <CommonModal :data="modalData" @onDataChange="onDataChange($event,'import')"></CommonModal>
  </div>
</template>

<script>
import Popover from "@/components/Popover.vue";
import CommonModal from "@/components/CommonModal.vue";
import { showErrorInfo } from '../js/common';
export default {
  components: {
    Popover,
    CommonModal,
  },
  props: {
    showDescription: { type: Boolean, default: true },
    descriptionContent: String,
    labelTitle: String,
    importBtnName: { type: String, default: "Import" },
    exportBtnName: { type: String, default: "Export" },
    exportBtnIcon: { type: String, default: "iconexport" },
    acceptFileType: String,
    uploadFunction: {
      type: Function,
      default: function () {
        console.log("upload");
      },
    },
    value: Object,
    modalConfirmName: String,
    loading: Boolean,
    modalTitle: String,
    isShowExport: { type: Boolean, default: false },
    onExport: {
      type: Function,
      default: function () {
        console.log("onExport");
      },
    },
    hintContent: String,
    showHint: { type: Boolean, default: false },
    maxSize: { type: Number, default: -1 },
    imgResolutionWidth: { type: Number, default: -1 },
    imgResolutionHeight: { type: Number, default: -1 },
    visibleModal: {type: Boolean, default: false},
  },
  data() {
    return {
      modalData: {
        title: " ",
        cancelBtnLabel: this.$t("Cancel"),
        submitBtnLabel: this.modalConfirmName,
        showFooter: true,
        visible: false,
        items: [
          {
            title: this.modalTitle,
            type: "file-input",
            key: "import",
            acceptFileType: this.acceptFileType,
            value: this.value,
            importBtnName: this.$t("Reset"),
            maxSize: this.maxSize,
            imgResolutionWidth: this.imgResolutionWidth,
            imgResolutionHeight: this.imgResolutionHeight,
          },
        ],
        onConfirm: this.onConfirm,
        confirmLoading: this.loading,
      },
    };
  },
  methods: {
    openModal: function () {
      this.modalData.visible = true;
    },
    onDataChange: function (event, type) {
      this.$emit("change", event.newVal);
    },
    onConfirm: function(){
      var fileName = this.modalData.items[0].value.fileName;
      if (fileName == "" || fileName == vm.$t("UpgradeFilePath")) {
        showErrorInfo(vm, vm.$t("FileEmptyWarning"));
        return;
      } else{
        return this.uploadFunction();
      }
    }
  },
  watch: {
    loading(newVal, oldVal) {
      this.modalData.confirmLoading = newVal;
    },
    visibleModal(newVal, oldVal) {
      this.modalData.visible = newVal;
    }
  },
};
</script>

<style lang="less" scoped>
.ak-file-input-div {
  padding-left: 400px;
  font-size: 16px;
  margin-top: 22px;
  display: flex;
  position: relative;
}

.ak-file-input-title-label {
  width: 290px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-top: 4px;
  color: #343434;
}

.ak-file-input-btn {
  text-overflow: clip;
  overflow: hidden;
  width: 120px;
  // margin-left: 130px;
}

.ak-common-file-input-hint-label {
  color: #9a9a9a;
  margin-left: 10px;
  padding-top: 4px;
}
</style>