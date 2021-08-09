<template>
  <div class="ak-table-file-input-div" v-if="isShow">
    <div :style="{display:'flex'}">
      <div class="ak-table-file-input-file-name">
        <label>{{value.fileName}}</label>
        <a-upload
          name="file"
          :showUploadList="false"
          :accept="acceptFileType"
          :beforeUpload="beforeUpload"
          :style="{float:'right'}"
        >
          <a-button type="file" class="ak-table-file-input-file-button">{{$t('UpgradeFile')}}</a-button>
        </a-upload>
      </div>
      <a-button type="danger" class="ak-table-file-input-btn" @click="onCancel">
        <MyIcon type="icondelete" :style="{fontSize:'16px',paddingRight:'6px'}"></MyIcon>
        {{ btnName }}
      </a-button>
    </div>
  </div>
</template>

<script>
import { deepClone, checkFileFormat, showErrorInfo } from "@/js/common.js";
export default {
  props: {
    acceptFileType: { type: String, default: "" },
    btnName: String,
    value: Object,
    upload: Function,
    index: Number,
    isShow: { type: Boolean, default: true },
    maxSize: { type: Number, default: -1 },
  },
  methods: {
    beforeUpload: function (info) {
      //check format
      let acceptTypes = this.acceptFileType.split(",");
      let checkSuccess = false;
      for (let i = 0; i < acceptTypes.length; i++) {
        if (checkFileFormat(info.name, acceptTypes[i], acceptTypes[i].length)) {
          checkSuccess = true;
        }
      }
      if (!checkSuccess) {
        showErrorInfo(this, this.$t("FileFormatWarning"));
        return false;
      }
      //check file size
      if (this.maxSize > 0 && info.size > this.maxSize) {
        showErrorInfo(this, this.$t("UploadingFileTooLargeWarning"));
        return false;
      }
      //check file name
      if (info.name.length > 127) {
        showErrorInfo(this, this.$t("WarningFileNameTooLong"));
        return false;
      }

      let oldValue = deepClone(this.value);
      this.value.fileData = info;
      this.value.fileName = info.name;
      this.onChange(oldValue);
      this.upload(info, this.index);
      return false;
    },
    onChange: function (oldVal) {
      let data = {
        newVal: {
          fileName: this.value.fileName,
          fileData: this.value.fileData,
        },
        oldVal: oldVal,
      };
      this.$emit("change", data);
    },
    onCancel: function () {
      let oldValue = deepClone(this.value);
      this.value.fileName = this.$t("UpgradeFilePath"),
      this.value.fileData = {};
      this.onChange(oldValue);
    },
  },
};
</script>


<style lang="less" scoped>
.ak-table-file-input-div {
  font-size: 16px;
}

.ak-table-file-input-file-name {
  width: 320px;
  border: 1px solid rgba(201, 201, 201, 1);
  border-radius: 3px;
  height: 32px;
  background: #ffffff;
  color: #999999;
  font-size: 16px;
  padding-left: 16px;
  font-weight: 400;
  text-align: left;
  line-height: 1.9;
}

.ak-table-file-input-file-name > label {
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 190px;
  display: inline-block;
  white-space: nowrap;
}

.ak-table-file-input-file-button {
  float: right;
  width: 110px;
  border-radius: 3px;
  border: none;
  background: #0087f7;
  font-size: 16px;
  color: #ffffff;
  height: 30px !important;
}

/deep/.ant-btn:hover,
.ant-btn:focus,
.ant-btn:active,
.ant-btn.active {
  background: #0087f7;
  color: #ffffff;
}

.ak-table-file-input-btn {
  flex: 1;
  margin-left: 30px;
  min-width: 120px;
  max-width: 120px;
  background: rgba(255, 243, 243, 1);
  border: 1px solid rgba(255, 99, 101, 1);
  border-radius: 5px;
  color: #f55b5f;
  font-size: 16px;
}

/deep/.ant-btn-danger:hover,
/deep/.ant-btn-danger:focus {
  background: rgba(255, 243, 243, 1);
  border: 1px solid rgba(255, 99, 101, 1);
  border-radius: 5px;
  color: #f55b5f;
}

.ant-btn-danger[disabled] > i {
  color: rgba(0, 0, 0, 0.25);
}
</style>