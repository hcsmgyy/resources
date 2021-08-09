<template>
  <div class="ak-common-table-head" :style="{position: 'relative'}">
    <CommonModal :data="data.addModalData" @onDataChange="onDataChange($event,'add')"></CommonModal>
    <div v-if="showImport">
      <CommonModal :data="data.importModalData" @onDataChange="onDataChange($event,'import')"></CommonModal>
    </div>
    <div class="ak-common-table-head-search" v-if="data.showSearch">
      <label>{{$t("Search")}}</label>
      <a-input :maxLength="63" v-model="searchValue"></a-input>
      <a-button type="primary" class="ak-commom-table-head-btn" @click="onSearch">{{$t("Search")}}</a-button>
    </div>

    <a-button type="primary" class="ak-commom-table-head-btn" @click="onAdd">
      <MyIcon type="iconadd1" :style="{fontSize:'14px',paddingRight:'6px',color:'#ffffff'}" ></MyIcon>
      {{$t('AddLabel')}}
    </a-button>
    <div v-if="showImport">
    <a-button type="primary" class="ak-commom-table-head-btn" @click="onImport">
      <MyIcon type="iconimport" :style="{fontSize:'14px',paddingRight:'6px'}" ></MyIcon>
      {{$t('Import')}}
    </a-button>
    <a-select
      :value="$t('Export')"
      dropdownClassName="ak-select-item"
      class="ak-commom-table-head-select"
      @change="onExport"
      :getPopupContainer="triggerNode => {return triggerNode.parentNode;}"
    >
      <a-icon
        slot="suffixIcon"
        type="caret-down"
        theme="filled"
        :style="{fontSize:'20px',color: '#666666'}"
      />
      <a-select-option v-for="item in data.exportItems" :key="item.key.toString()">{{ item.label }}</a-select-option>
    </a-select>
    </div>
  </div>
</template>

<script>
var vm = {};
function openAddModal() {
  if (vm != {}) {
    vm.data.addModalData.visible = true;
  }
}

function openImportModal() {
  if (vm != {}) {
    vm.data.importModalData.visible = true;
  }
}

import CommonModal from "@/components/CommonModal.vue";
export default {
  components: {
    CommonModal,
  },
  props: {
    data: Object,
    showImport: { type: Boolean, default: true },
    onImport: {
      type: Function,
      default: function () {
        openImportModal();
        console.log("click import");
      },
    },
  },
  data() {
    return {
      searchValue: "",
    };
  },
  methods: {
    onDataChange: function (event, type) {
      let result = {
        oldVal: event.oldVal,
        newVal: event.newVal,
        modalKey: event.itemKey,
        modalIndex: event.itemIndex,
        type: type,
      };
      this.$emit("onDataChange", result);
    },
    onExport(value) {
      this.data.onExport(value);
    },
    onAdd() {
      this.data.addModalData.key = -1;
      let items = this.data.addModalData.items;
      for (let i = 0; i < items.length; i++) {
        if ("undefined" != typeof items[i].defaultValue) {
          items[i].value = items[i].defaultValue;
        } else {
          items[i].value = "";
        }
        items[i].disabled = false;
      }
      if ("undefined" != typeof this.data.addModalData["onAdd"]) {
        this.data.addModalData.onAdd();
      }

      this.data.addModalData.visible = true;
    },
    onSearch() {
      console.log("onSearch=", this.searchValue);
    },
  },
  mounted() {
    vm = this;
  },
};
</script>



<style lang="less" scoped>
.ak-commom-table-head-btn {
  width: 110px;
  color: #ffffff;
  font-size: 16px;
  background: #0087f7;
  margin-left: 20px;
}

.ak-common-table-head {
  display: inline-flex;
  float: right;
  margin-bottom: 16px;
}

.ak-commom-table-head-select {
  width: 110px;
  margin-left: 20px;
}
/deep/.ant-select-arrow {
  top: 40%;
}

/deep/.ant-select-selection-selected-value {
  font-size: 16px;
}

.ak-common-table-head-search {
  display: flex;
}

.ak-common-table-head-search > input {
  width: 156px;
}
.ak-common-table-head-search > label {
  margin-right: 30px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-top: 4px;
  font-size: 16px;
  color: #333333;
}
</style>