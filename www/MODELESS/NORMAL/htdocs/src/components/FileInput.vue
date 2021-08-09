<template>
  <div class="ak-common-file-input-div" >
    <label class="ak-common-file-input-title-label">{{labelTitle}}</label>
    <div class="ak-common-file-input-file-name">
      <label>{{fileName}}</label>
      <a-upload
        name="file"
        :showUploadList="false"
        :accept="acceptFileType"
        :beforeUpload="beforeUpload"
        :style="{float:'right'}"
      >
        <a-button type="file" class="ak-common-file-input-file-button">{{$t('UpgradeFile')}}</a-button>
      </a-upload>
    </div>
    <a-button
      type="primary"
      class="ak-common-file-input-btn"
      @click="uploadFunction"
      :loading="loading"
      :disabled="importBtnDisabled"
    >{{ importBtnName }}</a-button>
    <a-button type="primary" class="ak-common-file-input-btn" @click="onCancel">{{ cancelBtnName}}</a-button>

    <Popover
      :showDescription="showDescription"
      :descriptionContent="descriptionContent"
      :style="{paddingLeft:'50px'}"
    ></Popover>
  </div>
</template>

<script>
import Popover from "@/components/Popover.vue";
export default {
  components: {
    Popover,
  },
  props: {
    showDescription: { type: Boolean, default: true },
    descriptionContent: String,
    labelTitle: String,
    value: { type: [String, Number], default: "" },
    acceptFileType: String,
    importBtnName: { type: String, default: "Import" },
    cancelBtnName: { type: String, default: "Cancel" },
    uploadFunction: {
      type: Function,
      default: function () {
        console.log("click import");
      },
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    beforeUpload: function (info) {
      this.fileData = info;
      this.fileName = info.name;
      this.onChange();
      return false;
    },
    onCancel: function () {
      this.fileName = "";
      this.fileData = {};
      this.onChange();
    },
    onChange: function () {
      let data = {
        fileName: this.fileName,
        fileData: this.fileData,
      };
      this.$emit("change", data);
    },
  },
  data() {
    return {
      fileName: this.$t("UpgradeFilePath"),
      fileData: {},
      importBtnDisabled: true,
    };
  },
  watch: {
    fileName(newVal, oldVal) {
      if (newVal != "" && newVal != this.$t("UpgradeFilePath")) {
        this.importBtnDisabled = false;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.ak-common-file-input-div {
  padding-left: 434px;
  font-size: 16px;
  margin-top: 22px;
  display: flex;
}

.ak-common-file-input-title-label {
  width: 290px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-top: 4px;
}

.ak-common-file-input-hint-label {
  color: #9a9a9a;
  margin-left: 10px;
  padding-top: 4px;
}

.ak-common-file-input-file-name {
  width: 380px;
  border: 1px solid rgba(201, 201, 201, 1);
  border-radius: 3px;
  height: 32px;
  background: rgba(249, 249, 249, 1);
  color: #999999;
  font-size: 16px;
  padding-left: 16px;
  font-weight: 400;
}

.ak-common-file-input-file-button {
  float: right;
  width: 110px;
  border-radius: 3px;
  border: none;
  background: #0087f7;
  font-size: 16px;
  color: #ffffff;
  height: 30px !important;
}

.ak-common-file-input-file-name > label {
  display: inline-block;
  margin-top: 2px;
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/deep/.ant-btn:hover,
.ant-btn:focus,
.ant-btn:active,
.ant-btn.active {
  background: #0087f7;
  color: #ffffff;
}

.ak-common-file-input-btn {
  width: 120px;
  background: #0087f7;
  color: #ffffff;
  font-size: 16px;
  margin-left: 30px;
}
</style>