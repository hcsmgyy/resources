<template>
  <div class="ak-modal-file-input-div">
    <div>
      <label class="ak-modal-file-input-title-label">{{labelTitle}}</label>
    </div>
    <div :style="{display:'flex'}">
      <div class="ak-modal-file-input-file-name">
        <label>{{value.fileName}}</label>
        <a-upload
          name="file"
          :showUploadList="false"
          :accept="acceptFileType"
          :beforeUpload="beforeUpload"
          :style="{float:'right'}"
        >
          <a-button type="file" class="ak-modal-file-input-file-button">{{$t('UpgradeFile')}}</a-button>
        </a-upload>
      </div>
      <a-button
        type="primary"
        class="ak-modal-file-input-btn"
        @click="onCancel"
        :disabled="importBtnDisabled"
      >
        <MyIcon type="iconreset" :style="{fontSize:'16px',paddingRight:'6px'}"></MyIcon>
        {{ importBtnName }}
      </a-button>

      <Popover
        :showDescription="showDescription"
        :descriptionContent="descriptionContent"
        :style="{paddingLeft:'50px'}"
      ></Popover>
    </div>
  </div>
</template>

<script>
import Popover from "@/components/Popover.vue";
import { checkFileFormat, showErrorInfo, checkShellRule } from "@/js/common.js";
export default {
  components: {
    Popover,
  },
  props: {
    showDescription: { type: Boolean, default: false },
    descriptionContent: String,
    labelTitle: String,
    acceptFileType: { type: String, default: "" },
    importBtnName: { type: String, default: "Import" },
    uploadFunction: {
      type: Function,
      default: function () {
        console.log("click import");
      },
    },
    value: Object,
    maxSize: { type: Number, default: 50 * 1024 * 1024 },
    imgResolutionWidth: { type: Number, default: -1 },
    imgResolutionHeight: { type: Number, default: -1 },
  },
  methods: {
    beforeUpload: function (info) {
      //check format
      let acceptTypes = this.acceptFileType.split(",");
      let checkSuccess = false;
      if (!checkShellRule(info.name)) {
        showErrorInfo(this, this.$t("FileNameShellError"));
        return false;
      }
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

      //check img resolution
      if (
        (checkFileFormat(info.name, ".PNG", 4) ||
          checkFileFormat(info.name, ".JPG", 4) ||
          checkFileFormat(info.name, ".JPEG", 5)) &&
        this.imgResolutionWidth > 0 &&
        this.imgResolutionHeight > 0
      ) {
        var reader = new FileReader();
        reader.readAsDataURL(info);
        var vm = this;
        reader.onload = function () {
          var img = new Image();
          img.src = reader.result;
          img.onload = function () {
            if (
              img.width > vm.imgResolutionWidth ||
              img.height > vm.imgResolutionHeight
            ) {
              showErrorInfo(vm, vm.$t("ImageResolutionErr"));
              return false;
            } else {
              info.height = img.height;
              info.width = img.width;
              vm.fileData = info;
              vm.value.fileName = info.name;
              vm.onChange();
              return false;
            }
          };
          img.onerror = function () {
            //图片加载错误
            showErrorInfo(vm, vm.$t("FileFormatWarning"));
            return false;
          };
        };
      } else {
        //done
        this.fileData = info;
        this.value.fileName = info.name;
        this.onChange();
        return false;
      }
    },
    onChange: function () {
      let data = {
        fileName: this.value.fileName,
        fileData: this.fileData,
      };
      this.$emit("change", data);
    },
    onCancel: function () {
      this.value.fileName = this.$t("UpgradeFilePath");
      this.fileData = {};
      this.onChange();
    },
  },
  data() {
    return {
      // fileName: this.$t("UpgradeFilePath"),
      fileData: {},
      importBtnDisabled: true,
    };
  },
  watch: {
    value(newVal, oldVal) {
      let fileName = newVal.fileName;
      if (fileName != "" && fileName != this.$t("UpgradeFilePath")) {
        this.importBtnDisabled = false;
      } else {
        this.importBtnDisabled = true;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.ak-modal-file-input-div {
  padding-left: 110px;
  font-size: 16px;
  margin-top: 25px;
}

.ak-modal-file-input-title-label {
  max-width: 700px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-top: 4px;
  margin-bottom: 26px;
  color: #333333;
}

.ak-modal-file-input-hint-label {
  color: #9a9a9a;
  margin-left: 10px;
  padding-top: 4px;
}

.ak-modal-file-input-file-name {
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

.ak-modal-file-input-file-button {
  float: right;
  width: 110px;
  border-radius: 3px;
  border: none;
  background: #0087f7;
  font-size: 16px;
  color: #ffffff;
  height: 30px !important;
}

.ak-modal-file-input-file-name > label {
  display: inline-block;
  margin-top: 2px;
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/deep/.ant-btn:hover,
.ant-btn:focus,
.ant-btn:active,
.ant-btn.active {
  background: #0087f7;
  color: #ffffff;
}

.ak-modal-file-input-btn {
  width: 120px;
  background: #0087f7;
  color: #ffffff;
  font-size: 16px;
  margin-left: 30px;
}
</style>