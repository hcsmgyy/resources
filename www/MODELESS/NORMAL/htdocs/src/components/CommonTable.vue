<template>
  <div class="ak-common-table">
    <CommonTableHead v-if="showHead" :data="tableHeadData" :showImport="showImport" @onDataChange="onHeadDataChange($event)"></CommonTableHead>
    <a-table
      :columns="computedTableColumns"
      :data-source="tableData"
      bordered
      :rowSelection="rowSelection"
      :pagination="false"
    >
      <template
        v-for="(column,columnIndex) in computedTableColumns"
        :slot="column.dataIndex"
        slot-scope="text,record"
      >
        <div :key="columnIndex" :style="{position:'relative'}">
          <!-- 输入框 -->
          <div v-if="column.type=='input'">
            <a-tooltip
              :trigger="text.isWarn ? 'hover' : 'none'"
              :getPopupContainer="triggerNode => {return triggerNode.parentNode;}"
            >
              <span slot="title" :style="{display:'flex'}">
                <MyIcon type="iconerror" class="ak-tooltips-icon"></MyIcon>
                <span class="ak-tooltips-label">{{text.warnLabel}}</span>
              </span>
              <div v-if="text.itemType == 'select'">
                <a-select
                  :value="text.value.toString()"
                  :style="text.isWarn? warnSelectStyle : commonSelectStyle"
                  :disabled="text.disabled"
                  @change="e=>handleSelectChange(e, record.key, column)"
                  dropdownClassName="ak-select-item"
                  :getPopupContainer="triggerNode => {return triggerNode.parentNode;}"
                >
                  <a-icon
                    slot="suffixIcon"
                    type="caret-down"
                    theme="filled"
                    :style="text.isWarn? warnSelectIconStyle : commonSelectIconStyle"
                  />
                  <a-select-option
                    v-for="item in column.selectItems"
                    :key="item.key.toString()"
                  >{{ item.label }}</a-select-option>
                </a-select>
              </div>
              <div v-else>
                <a-input
                  :type="column.inputType"
                  :value="text.value"
                  :maxLength="column.maxLength ? column.maxLength : 63"
                  @change="e => handleInputChange(e.target.value, record.key, column)"
                  :style="text.isWarn? warnInputStyle : commonInputStyle"
                  :disabled="text.disabled"
                >
                  <a-select
                    slot="addonBefore"
                    style="width: 94px"
                    v-model="text.addOnBefore"
                    v-if="column.addOnBeforeItems"
                    @change="e => handleInputAddBeforeChange(text.value,record.key, column)"
                    :getPopupContainer="triggerNode => {return triggerNode.parentNode;}"
                  >
                    <a-icon
                      slot="suffixIcon"
                      type="caret-down"
                      theme="filled"
                      :style="text.isWarn? warnSelectIconStyle : commonSelectIconStyle"
                    />
                    <a-select-option
                      v-for="item in column.addOnBeforeItems"
                      :key="item.key.toString()"
                    >{{ item.label }}</a-select-option>
                  </a-select>
                </a-input>
              </div>
            </a-tooltip>
          </div>
          <!-- 下拉选择框 -->
          <div v-else-if="column.type=='select'">
            <a-tooltip
              :trigger="text.isWarn ? 'hover' : 'none'"
              :getPopupContainer="triggerNode => {return triggerNode.parentNode;}"
            >
              <span slot="title" :style="{display:'flex'}">
                <MyIcon type="iconerror" class="ak-tooltips-icon"></MyIcon>
                <span class="ak-tooltips-label">{{text.warnLabel}}</span>
              </span>
              <div v-if="text.itemType == 'input'">
                <a-input
                  :value="text.value"
                  :maxLength="column.maxLength ? column.maxLength : 63"
                  @change="e => handleInputChange(e.target.value, record.key, column)"
                  :style="text.isWarn? warnInputStyle : commonInputStyle"
                  :disabled="text.disabled"
                />
              </div>
              <div v-else>
                <a-select
                  :value="typeof text.value === 'number'?text.value.toString():text.value "
                  :style="text.isWarn? warnSelectStyle : commonSelectStyle"
                  :class="text.isWarn?'ant-select-warn':'ant-select-normal'"
                  :disabled="text.disabled"
                  :mode="column.mode"
                  @change="e=>handleSelectChange(e, record.key, column)"
                  dropdownClassName="ak-select-item"
                  :getPopupContainer="triggerNode => {return triggerNode.parentNode;}"
                >
                  <a-icon
                    slot="suffixIcon"
                    type="caret-down"
                    theme="filled"
                    :style="text.isWarn? warnSelectIconStyle : commonSelectIconStyle"
                  />
                  <a-select-option
                    v-for="item in column.selectItems"
                    :key="item.key.toString()"
                  >{{ item.label }}</a-select-option>
                </a-select>
              </div>
            </a-tooltip>
          </div>
          <!-- file input -->
          <TableFileInput
            v-else-if="column.type=='file-input'"
            :btnName="column.btnName"
            :value="text"
            :acceptFileType="column.acceptFileType"
            :upload="column.upload"
            :index="record.key"
            :isShow="text.isShow"
            @change="handleFileInputChange($event,record.key, column)"
          ></TableFileInput>
          <!-- checkbox -->
          <a-checkbox
            v-else-if="column.type=='checkbox'"
            :checked="text.value"
            :disabled="text.disabled"
            @change="e => handleCheckboxChange(e.target.checked,record.key, column)"
          ></a-checkbox>
          <!-- edit图标 -->
          <div v-else-if="column.type=='edit'">
            <MyIcon
              type="iconEdit"
              :style="{cursor:'pointer',fontSize:'22px',color:'#0087F7'}"
              @click="onEdit(text,record.key,column)"
            ></MyIcon>
          </div>
          <a 
            v-else-if="column.type=='click-label'"
            @click="onClickDial(record.index)"
            class="ak-common-table-a"
          >{{text}}</a>
          <label 
            v-else-if="column.type=='style-label'"
            :style="text.isRedLabel ? redLabelStyle : commonLabelStyle"
          >{{text.value}}</label>
          <!-- 常规label -->
          <label v-else>{{text}}</label>
        </div>
      </template>
    </a-table>
    <CommonTableFooter v-if="showFooter" :data="tableFooterData" @onPageChange="clearSelect"></CommonTableFooter>
  </div>
</template>

<script>
import Vue from "vue";
import { Icon } from "ant-design-vue";
import iconFront from "../js/iconfont";
import { getTransTitle } from "@/js/common.js";
import CommonTableHead from "@/components/CommonTableHead.vue";
import CommonTableFooter from "@/components/CommonTableFooter.vue";
import TableFileInput from "@/components/TableFileInput.vue";

const IconFont = Icon.createFromIconfontCN({
  scriptUrl: iconFront,
});

Vue.component("MyIcon", IconFont);

export default {
  components: {
    CommonTableHead,
    CommonTableFooter,
    TableFileInput,
  },
  props: {
    isRedLabel: { type: Boolean, default: false },
    showHead: { type: Boolean, default: false },
    showFooter: { type: Boolean, default: false },
    tableColumns: Array,
    tableData: Array,
    showRowSelection: {
      type: Boolean,
      default: false,
    },
    tableHeadData: Object,
    showImport: { type: Boolean, default: true },
    tableFooterData: Object,
    selectedRowKeys: {
      type: Array,
      default: function () {
        return [];
      },
    },
    getCheckboxPropsDisable: {
      type: Function,
      default: function (record) {
        return record;
      },
    },
    onClickDial: {
      type: Function,
      default: function () {
        console.log("click");
      },
    },
  },
  methods: {
    handleInputChange: function (value, key, column) {
      //隐藏tips，待优化，这个写法不好
      let tipsArr = document.getElementsByClassName("ant-tooltip");
      for (let i = 0; i < tipsArr.length; i++) {
        tipsArr[i].style.display = "none";
      }
      this.onChange(value, key, column.dataIndex, "input");
    },
    handleInputAddBeforeChange: function (value, key, column) {
      this.handleInputChange(value, key, column);
    },
    handleCheckboxChange: function (checked, key, column) {
      this.onChange(checked, key, column.dataIndex, "checkbox");
    },
    handleFileInputChange: function (event, key, column) {
      this.onChange(event, key, column.dataIndex, "file-input");
    },
    handleSelectChange: function (value, key, column) {
      //隐藏tips，待优化，这个写法不好
      let tipsArr = document.getElementsByClassName("ant-tooltip");
      for (let i = 0; i < tipsArr.length; i++) {
        tipsArr[i].style.display = "none";
      }
      this.onChange(value, key, column.dataIndex, "select");
    },
    onChange: function (value, index, dataIndex, type) {
      let data = {
        value: value,
        index: index,
        dataIndex: dataIndex,
        type: type,
      };
      this.$emit("change", data);
    },
    onHeadDataChange: function (event) {
      let result = {
        type: "modal",
        oldVal: event.oldVal,
        newVal: event.newVal,
        modalKey: event.modalKey,
        modalIndex: event.modalIndex,
        tableOperateType: event.type,
      };
      this.$emit("change", result);
    },
    onEdit: function (index, key, column) {
      this.tableHeadData.addModalData.key = key;
      column.onEdit(index, key);
      this.tableHeadData.addModalData.visible = true;
    },
    clearSelect: function () {
      this.defaultRowSelection.selectedRowKeys = [];
    },
  },

  computed: {
    rowSelection: function () {
      return this.showRowSelection ? this.defaultRowSelection : null;
    },
    computedTableColumns: function() {
      let table = this.tableColumns;
      for (var i = 0; i < table.length; i++) {
        if ("undefined" != typeof(table[i].isHidden) && table[i].isHidden) {
          table.splice(i,1);
          i--;
        }
      }
      return table;
    }
  },
  watch: {
    selectedRowKeys(newVal, oldVal) {
      if (this.showFooter) {
        this.tableFooterData.deleteDisabled = newVal.length <= 0;
      }
      this.defaultRowSelection.selectedRowKeys = newVal;
    },
    tableData(newVal, oldVal) {
      if (this.showFooter) {
        this.tableFooterData.deleteAllDisabled = newVal.length <= 0;
      }
    },
  },
  data() {
    return {
      commonInputStyle: {
        fontSize: "16px",
        textAlign: "center",
      },
      warnInputStyle: {
        fontSize: "16px",
        textAlign: "center",
        border: "1px solid rgba(255,86,96,1)",
        color: "#FF5660",
      },
      commonSelectStyle: {
        width: "100%",
      },
      warnSelectStyle: {
        width: "100%",
        border: "1px solid #F29293",
        borderRadius: "4px",
        color: "#F29293",
      },
      warnSelectIconStyle: {
        color: "#F29293",
        fontSize: "20px",
      },
      commonSelectIconStyle: {
        color: "#666666",
        fontSize: "20px",
      },
      defaultRowSelection: {
        onChange: (selectedRowKeys, selectedRows) => {
          let result = {
            type: "selection",
            newVal: selectedRowKeys,
            oldVal: "",
            tableOperateType: "selection",
          };
          this.$emit("change", result);
        },
        getCheckboxProps:record => {
          return this.getCheckboxPropsDisable(record);
        },
        selectedRowKeys: this.selectedRowKeys,
      },
      commonLabelStyle: {
        color: "#888888",
      },
      redLabelStyle: {
        color: "#ff0000",
      },
    };
  },
};
</script>

<style lang="less" scoped>
.ak-common-table {
  margin-left: 35px;
  margin-right: 35px;
  margin-top: 20px;
}

/deep/.ant-table-thead {
  background: #0088f7;
}
/deep/.ant-table {
  font-size: 16px;
}

/deep/.ant-table-thead > tr > th {
  background: rgba(255, 255, 255, 0.9);
  font-weight: bold;
}
/deep/.ant-table-tbody > tr > td {
  padding-left: 6px;
  padding-right: 6px;
  padding-top: 8px;
  padding-bottom: 8px;
}

.ak-tooltips-icon {
  font-size: 16px;
  color: #f75f61;
  align-items: center;
  justify-content: center;
  display: flex;
}

.ak-tooltips-label {
  max-width: 340px;
  text-indent: 5px;
  margin-left: 10px;
}

/deep/.ant-tooltip-arrow {
  display: none;
}

/deep/.ant-tooltip {
  max-width: 380px;
}
/deep/.ant-tooltip-inner {
  background: rgba(251, 239, 239, 1);
  color: #656565;
  font-size: 14px;
  border: 1px solid rgba(242, 146, 147, 1);
  border-radius: 3px;
}

/deep/.ant-tooltip-placement-top {
  padding-bottom: 3px;
}

.ant-table-wrapper {
  pointer-events: none;
}
/deep/.ant-table {
  pointer-events: auto;
}

/deep/.ant-select-arrow {
  top: 40%;
}

/deep/.ant-select-selection {
  text-align: center;
}
/deep/.ant-select-selection-selected-value {
  float: left;
  font-size: 16px;
  width: 100%;
  color: #000000a6;
}


/deep/.ant-select-warn > div > div >.ant-select-selection-selected-value{
  color: rgba(242, 146, 147, 1);
}

.ak-common-table-a{
  text-decoration: underline;
  cursor: pointer;
}

</style>