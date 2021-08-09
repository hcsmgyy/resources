<template>
  <div>
    <a-modal
      :getPopupContainer="triggerNode => {return triggerNode.parentNode;}"
      :title="data.title"
      :visible="data.visible"
      :centered="true"
      @cancel="onCancel"
    >
      <template v-for="(item,itemIndex) in data.items">
        <div :key="item.key">
          <CommonInput
            :addOnBefore="item.addOnBefore"
            v-if="item.type == 'input'"
            :wholeStyle="inputStyle"
            :labelTitle="item.title"
            :descriptionContent="item.description"
            :hintContent="item.hintContent"
            :showHint="item.showHint"
            :disabled="item.disabled"
            :inputType="item.inputType"
            :isWarn="item.isWarn"
            :warnLabel="item.warnLabel"
            :value="item.value"
            @change="onChange($event, item,item.key,itemIndex)"
            :maxLength="item.maxLength"
            :placeholder="item.placeholder"
          ></CommonInput>
          <CommonSelect
            v-else-if="item.type=='select'"
            :wholeStyle="inputStyle"
            :labelTitle="item.title"
            :itemData="item.selectItems"
            :value="item.value"
            @change="onChange($event, item,item.key,itemIndex)"
            :showHint="item.showHint"
            :hintContent="item.hintContent"
            :isWarn="item.isWarn"
            :warnLabel="item.warnLabel"
            :disabled="item.disabled"
            :showBtn="item.showBtn"
            :onDel="item.onDel"
            :loading="item.loading"
            :delDisabled="item.delDisabled"
            :descriptionContent="item.description"
            :mode="item.mode"
          ></CommonSelect>
          <ModalFileInput
            v-else-if="item.type=='file-input'"
            :labelTitle="item.title"
            @change="onChange($event,item,item.key,itemIndex)"
            :importBtnName="item.importBtnName"
            :cancelBtnName="item.cancelBtnName"
            :uploadFunction="item.uploadFunction"
            :acceptFileType="item.acceptFileType"
            :maxSize="item.maxSize"
            :value="item.value"
            :imgResolutionWidth="item.imgResolutionWidth"
            :imgResolutionHeight="item.imgResolutionHeight"
          ></ModalFileInput>
          <img
            v-else-if="item.type=='image'"
            :src="require('../Image/'+item.imgName)"
            class="ak-modal-img"
          />
          <div v-else-if="item.type=='loading'">
            <label>Processing,please wait ...</label>
          </div>
        </div>
      </template>

      <template slot="footer">
        <div class="ak-common-modal-footer">
          <div v-if="data.showFooter">
            <a-button
              @click="onCancel"
              class="ak-common-modal-footer-btn ak-common-modal-footer-cancel"
              type="danger"
            >{{data.cancelBtnLabel}}</a-button>
            <a-button
              class="ak-common-modal-footer-btn ak-common-modal-footer-confirm"
              type="primary"
              @click="data.onConfirm"
              :loading="data.confirmLoading"
            >{{data.submitBtnLabel}}</a-button>
          </div>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<script>
import CommonInput from "@/components/CommonInput.vue";
import CommonSelect from "@/components/CommonSelect.vue";
import ModalFileInput from "@/components/ModalFileInput.vue";

export default {
  components: {
    CommonInput,
    ModalFileInput,
    CommonSelect,
  },
  props: {
    data: Object,
  },
  data() {
    return {
      inputStyle: {
        paddingLeft: "110px",
        fontSize: "16px",
        marginTop: "16px",
        display: "flex",
        position: "relative",
      },
    };
  },
  methods: {
    onChange: function (data, item, itemKey, itemIndex) {
      let oldVal = item.value;
      let newVal = data;

      //点击后默认取消掉错误提示
      item.isWarn = false;
      item.value = data;

      let result = {
        oldVal: oldVal,
        newVal: newVal,
        itemKey: itemKey,
        itemIndex: itemIndex,
      };

      this.$emit("onDataChange", result);
    },
    onCancel: function () {
      if (!this.data.confirmLoading) {
        let items = this.data.items;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type == "input") {
            items[i].isWarn = false;
          } else if (items[i].type == "file-input"){ 
              items[i].value.fileName = this.$t("UpgradeFilePath");
              items[i].fileData = {};
          }
        }
        if(!this.data.disabledVisible){
          this.data.visible = false;
        }
      }
    },
  },
  computed: {
    imgSrc() {
      return "../Image/home_page.jpg";
    },
  },
};
</script>

<style lang="less" scoped>
.ak-common-modal {
  width: 950px;
}

/deep/.ant-modal-content {
  left: -54px;
  width: 950px;
  border-radius: 10px;
}

/deep/.ant-modal-footer {
  padding-top: 0px;
  border-top: unset;
}

.ak-common-modal-footer {
  margin-bottom: 40px;
  margin-right: 34px;
}

.ak-common-modal-footer > div {
  padding-top: 60px;
}

.ak-common-modal-footer-btn {
  width: 120px;
  font-size: 16px;
  border-radius: 5px;
  margin-left: 30px;
}
.ak-common-modal-footer-cancel {
  background: rgba(241, 241, 241, 1);
  color: #656565;
  border: unset;
}
.ak-common-modal-footer-confirm {
  background: rgba(0, 135, 247, 1);
  color: #ffffff;
  border: unset;
}
/deep/.ant-modal-title {
  font-size: 20px;
  color: #333333;
  font-weight: bold;
  min-height: 22px;
}
/deep/.ant-modal-header {
  margin: 15px;
  padding: 15px 15px;
  border-bottom-color: #d3dbe1;
}

/deep/.ant-modal-body {
  padding-top: 0px;
  padding-bottom: 0px;
}
/deep/.ant-btn-danger:hover,
/deep/ .ant-btn-danger:focus {
  color: #656565;
  background-color: #f9f9f9;
}

.ak-modal-img {
  display: block;
  margin: 0 auto;
}
</style>