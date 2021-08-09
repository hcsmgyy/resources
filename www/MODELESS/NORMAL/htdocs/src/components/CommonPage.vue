<template>
  <div v-if="data.getDataSuccess" class="ak-common-page-div">
    <BreadCrumb :firstTitle="data.breadCrumb.firstTitle" :secondTitle="data.breadCrumb.secondTitle"></BreadCrumb>
    <template v-for="(content,contentIndex) in data.contents">
      <div class="ak-content" :key="content.key" :style="{marginLeft:'30px'}">
        <ContentTitle
          :title="content.title"
          :descriptionContent="content.titleDescription"
          :showExample="content.showExample"
          :imgName="content.imgName"
        ></ContentTitle>
        <template v-for="(item,itemIndex) in content.items">
          <div :key="item.key">
            <CommonInput
              v-if="item.type=='input' && item.isHide != true"
              :labelTitle="item.title"
              :descriptionContent="item.description"
              :showDescription="item.showDescription"
              :hintContent="item.hintContent"
              :showHint="item.showHint"
              :disabled="item.disabled"
              :inputType="item.inputType"
              :isShow="item.isShow"
              :isWarn="item.isWarn"
              :warnLabel="item.warnLabel"
              :maxLength="item.maxLength"
              :value="item.value"
              @change="onChange($event, item,content.key,item.key,contentIndex,itemIndex)"
              :showBtn="item.showBtn"
              :showBtn2="item.showBtn2"
              :onClick="item.onClick"
              :onSearch="item.onSearch"
              :onReset="item.onReset"
              :showEmptyPwd="item.showEmptyPwd"
              :placeholder="item.placeholder"
              :id="item.key"
              :pingLoading="item.pingLoading"
            ></CommonInput>
            <CommonSelect
              v-else-if="item.type=='select' && item.isHide != true"
              :labelTitle="item.title"
              :itemData="item.selectItems"
              :value="item.value"
              @change="onChange($event, item,content.key,item.key,contentIndex,itemIndex)"
              :showHint="item.showHint"
              :hintContent="item.hintContent"
              :isWarn="item.isWarn"
              :warnLabel="item.warnLabel"
              :disabled="item.disabled"
              :showBtn="item.showBtn"
              :onDel="item.onDel"
              :loading="item.loading"
              :delDisabled="item.delDisabled"
              :showCallLogBtn="item.showCallLogBtn"
              :onHangup="item.onHangup"
              :onExport="item.onExport"
              :showChangeBtn="item.showChangeBtn"
              :ChangeLabel="item.ChangeLabel"
              :onClickChange="item.onClickChange"
              :id="item.key"
              :descriptionContent="item.description"
              :showDescription="item.showDescription"
            ></CommonSelect>
            <CommonCheckBox
              v-else-if="item.type=='checkbox'"
              :labelTitle="item.title"
              :value="item.value"
              @change="onChange($event, item,content.key,item.key,contentIndex,itemIndex)"
              :disabled="item.disabled"
              :descriptionContent="item.description"
            ></CommonCheckBox>
            <CommonTable
              v-else-if="item.type=='table'"
              :tableColumns="item.tableColumns"
              :tableData="item.tableData"
              @change="onChange($event,item,content.key,item.key,contentIndex,itemIndex)"
              :showRowSelection="item.showRowSelection"
              :showHead="item.showHead"
              :showFooter="item.showFooter"
              :showImport="item.showImport"
              :tableHeadData="item.tableHeadData"
              :tableFooterData="item.tableFooterData"
              :selectedRowKeys="item.selectedRowKeys"
              :getCheckboxPropsDisable="item.getCheckboxPropsDisable"
              :onClickDial="item.onClickDial"
              :isRedLabel="item.isRedLabel"
            ></CommonTable>
            <CommonLabel
              v-else-if="item.type=='label'"
              :labelTitle="item.title"
              :value="item.value"
              :showDescription="item.showDescription"
              :titleBold="item.titleBold"
              :textAlign="item.textAlign"
              :descriptionContent="item.description"
            ></CommonLabel>
            <CommonFileInput
              v-else-if="item.type=='file-input' && item.isHide != true"
              :labelTitle="item.title"
              @change="onChange($event,item,content.key,item.key,contentIndex,itemIndex)"
              :importBtnName="item.importBtnName"
              :exportBtnName="item.exportBtnName"
              :cancelBtnName="item.cancelBtnName"
              :uploadFunction="item.uploadFunction"
              :acceptFileType="item.acceptFileType"
              :loading="item.loading"
              :value="item.value"
              :modalConfirmName="item.modalConfirmName"
              :modalTitle="item.modalTitle"
              :isShowExport="item.isShowExport"
              :onExport="item.onExport"
              :showHint="item.showHint"
              :hintContent="item.hintContent"
              :imgResolutionWidth="item.imgResolutionWidth"
              :imgResolutionHeight="item.imgResolutionHeight"
              :maxSize="item.maxSize"
              :descriptionContent="item.description"
              :visibleModal="item.visible"
            ></CommonFileInput>
            <CommonTransfer
              v-else-if="item.type=='transfer'"
              :sourceTitle="item.sourceTitle"
              :targetTitle="item.targetTitle"
              :mockData="item.mockItems"
              :targetKeys="item.value"
              :selectedKeys="item.selectedKeys"
              @change="onChange($event,item,content.key,item.key,contentIndex,itemIndex)"
              @selectChange="item.selectedKeys = $event"
            ></CommonTransfer>
            <CommonTime
              v-else-if="item.type=='time'"
              :labelTitle="item.title"
              :descriptionContent="item.description"
              :value="item.value"
              :timeFormat="item.timeFormat"
              @change="onChange($event, item,content.key,item.key,contentIndex,itemIndex)"
              :disabled="item.disabled"
              :showHint="item.showHint"
              :hintContent="item.hintContent"
              :use12Hours="item.use12Hours"
            ></CommonTime>
            <CommonRadioGroup
              v-else-if="item.type=='radiogroup'"
              :value="item.value"
              :labelTitle="item.title"
              :itemData="item.radioItems"
              :descriptionContent="item.description"
              @change="onChange($event, item,content.key,item.key,contentIndex,itemIndex)"
            ></CommonRadioGroup>
            <CommonMultipleInput
              v-else-if="item.type=='multipleInput'"
              :labelTitle="item.title"
              :itemData="item.value"
              :descriptionContent="item.description"
              @change="onChange($event, item,content.key,item.key,contentIndex,itemIndex)"
            ></CommonMultipleInput>
            <CommonDate
              v-else-if="item.type=='date'"
              :labelTitle="item.title"
              :descriptionContent="item.description"
              :value="item.value"
              :dateFormat="item.dateFormat"
              @change="onChange($event, item,content.key,item.key,contentIndex,itemIndex)"
              :disabled="item.disabled"
              :showHint="item.showHint"
              :hintContent="item.hintContent"
            ></CommonDate>
            <CommonMultipleCheckBox
              v-else-if="item.type=='multiple-checkbox'"
              :labelTitle="item.title"
              :isShowPopover="item.isShowPopover"
              :isShow="item.isShow"
              :value="item.value"
              :itemData="item.checkboxItems"
              @change="onChange($event, item,content.key,item.key,contentIndex,itemIndex)"
              :descriptionContent="item.description"
            ></CommonMultipleCheckBox>
            <CommonButton
              v-else-if="item.type=='button'"
              :labelTitle="item.title"
              :widthStyle="item.widthStyle"
              :buttonName="item.buttonName"
              :isShowPopover="item.isShowPopover"
              :onClick="item.onClick"
              :buttonIcon="item.buttonIcon"
              :descriptionContent="item.description"
            ></CommonButton>
            <DialInput
              v-else-if="item.type=='dialInput'"
              :itemData="item.selectItems"
              :selectValue="item.selectValue"
              :descriptionContent="item.description"
            ></DialInput>
            <CommonMultipleButton
              v-else-if="item.type=='multilple-button'"
              :labelTitle="item.title"
              :startDisabled="item.startDisabled"
              :stopDisabled="item.stopDisabled"
              :exportDisabled="item.exportDisabled"
              :startBtnName="item.startBtnName"
              :stopBtnName="item.stopBtnName"
              :exportBtnName="item.exportBtnName"
              :onStart="item.onStart"
              :onStop="item.onStop"
              :onExport="item.onExport"
              :descriptionContent="item.description"
            ></CommonMultipleButton>
            <CommonDeleteButton
              v-else-if="item.type=='delete-button'"
              :onDel="item.onDel"
              :onDelAll="item.onDelAll"
              :delLoading="item.delLoading"
              :delAllLoading="item.delAllLoading"
              :delDisabled="item.delDisabled"
              :delAllDisabled="item.delAllDisabled"
            ></CommonDeleteButton>
            <CommonTextArea
              v-else-if="item.type=='text-area'"
              :value="item.value"
              :disabled="item.disabled"
              :readonly="item.readonly"
            ></CommonTextArea>
          </div>
        </template>
      </div>
    </template>
    <CommonSubmit
      :isShow="data.showSubmit"
      :onSubmit="data.onSubmit"
      :onCancel="data.onCancel"
      :submitLoading="data.submitLoading"
      :cancelLoading="data.cancelLoading"
    ></CommonSubmit>
    <CommonChangePwd
      v-if="data.isChangePwdShow"
      :data="data.modalVisible"
      :userName="data.userName"
      :cancelBtnLabel="data.cancelBtnLabel"
      :title="data.modalTitle"
      :oldPswShow="data.oldPswShow"
    ></CommonChangePwd>
    <Processing></Processing>
  </div>
  <div v-else-if="data.showNoPermission">
    <p :style="{textAlign: 'center', fontSize: '26px'}">
      {{this.$t("NoPermissionSet")}}
    </p>
  </div>
  <div v-else>
    <a-spin :style="{width:'100%',margin:'0 auto',marginTop:'200px'}">
      <a-icon slot="indicator" type="loading" style="font-size: 100px" spin />
    </a-spin>
  </div>
</template>

<script>
import BreadCrumb from "@/components/BreadCrumb.vue";
import ContentTitle from "@/components/ContentTitle.vue";
import CommonInput from "@/components/CommonInput.vue";
import CommonSelect from "@/components/CommonSelect.vue";
import CommonSubmit from "@/components/CommonSubmit.vue";
import CommonCheckBox from "@/components/CommonCheckBox.vue";
import CommonTable from "@/components/CommonTable.vue";
import CommonLabel from "@/components/CommonLabel.vue";
import CommonFileInput from "@/components/CommonFileInput.vue";
import CommonTransfer from "@/components/CommonTransfer.vue";
import CommonTime from "@/components/CommonTime.vue";
import CommonRadioGroup from "@/components/CommonRadioGroup.vue";
import CommonMultipleInput from "@/components/CommonMultipleInput.vue";
import CommonDate from "@/components/CommonDate.vue";
import CommonMultipleCheckBox from "@/components/CommonMultipleCheckBox.vue";
import CommonButton from "@/components/CommonButton.vue";
import DialInput from "@/components/DialInput.vue";
import CommonMultipleButton from "@/components/CommonMultipleButton.vue";
import CommonChangePwd from "@/components/CommonChangePwd.vue";
import CommonModal from "@/components/CommonModal.vue";
import Processing from "@/components/Processing.vue";
import CommonDeleteButton from "@/components/CommonDeleteButton.vue";
import CommonTextArea from "@/components/CommonTextArea.vue";

import { deepClone, setDataChanged } from "@/js/common.js";
import moment from "moment";

export default {
  components: {
    BreadCrumb,
    ContentTitle,
    CommonInput,
    CommonSelect,
    CommonSubmit,
    CommonCheckBox,
    CommonLabel,
    CommonTable,
    CommonFileInput,
    CommonTransfer,
    CommonTime,
    CommonRadioGroup,
    CommonMultipleInput,
    CommonDate,
    CommonMultipleCheckBox,
    CommonButton,
    DialInput,
    CommonMultipleButton,
    CommonChangePwd,
    CommonModal,
    Processing,
    CommonDeleteButton,
    CommonTextArea,
  },
  props: {
    data: Object,
    onSubmit: Function,
    onCancel: Function,
  },
  data() {
    return {
    };
  },
  methods: {
    onChange: function (
      data,
      item,
      contentKey,
      itemKey,
      contentIndex,
      itemIndex
    ) {
      let oldVal = item.value;
      let newVal = data;
      if (item.type == "table") {
        oldVal = item.tableData;
        newVal = deepClone(item.tableData);
        if (
          data.type == "input" ||
          data.type == "select" ||
          data.type == "checkbox"
        ) {
          newVal[data.index][data.dataIndex].value = data.value;
          newVal[data.index][data.dataIndex].isWarn = false;
          item.tableData = newVal;
        } else if (data.type == "modal") {
          oldVal = data.oldVal;
          newVal = data.newVal;
        } else if (data.type == "selection") {
          item.selectedRowKeys = data.newVal;
          newVal = data.newVal;
          oldVal = [];
        } else if (data.type == "select") {
          newVal[data.index][data.dataIndex].value = data.value;
          newVal[data.index][data.dataIndex].isWarn = false;
          item.tableData = newVal;
        } else if (data.type == "file-input") {
          newVal[data.index][data.dataIndex].fileName =
            data.value.newVal.fileName;
          newVal[data.index][data.dataIndex].fileData =
            data.value.newVal.fileData;
          oldVal[data.index][data.dataIndex].fileName =
            data.value.oldVal.fileName;
          oldVal[data.index][data.dataIndex].fileData =
            data.value.oldVal.fileData;
          item.tableData = newVal;
        }
      } else {
        //点击后默认取消掉错误提示
        item.isWarn = false;
        item.value = data;
      }

      let result = {
        oldVal: oldVal,
        newVal: newVal,
        itemKey: itemKey,
        contentKey: contentKey,
        contentIndex: contentIndex,
        itemIndex: itemIndex,
        modalKey: data["modalKey"],
        modalIndex: data["modalIndex"],
        tableOperateType: data["tableOperateType"],
      };
      setDataChanged(true);
      this.$emit("onDataChange", result);
    },
  },
};
</script>


<style lang="less">
.ant-back-top{
  bottom: 20px !important;
}
</style>