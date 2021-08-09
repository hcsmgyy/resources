<template>
  <div class="ak-common-table-footer">
    <a-button
      type="danger"
      class="ak-common-table-footer-btn"
      @click="data.onDelete"
      :disabled="data.deleteDisabled"
    >
      <MyIcon type="icondelete" class="ak-common-table-footer-btn-icon"></MyIcon>
      <span class="ak-common-table-footer-btn-label">{{$t("DeleteLabel")}}</span>
    </a-button>
    <a-button
      type="danger"
      class="ak-common-table-footer-btn"
      @click="data.onDeleteAll"
      :disabled="data.deleteAllDisabled"
    >
      <MyIcon type="icondelete" class="ak-common-table-footer-btn-icon"></MyIcon>
      <span class="ak-common-table-footer-btn-label">{{$t("DeleteAllLabel")}}</span>
    </a-button>
    <a-button
      type="primary"
      :style="{width:'90px',marginLeft:'234px'}"
      @click="onPrePage"
      :disabled="preDisabled"
    >{{$t("PrevLabel")}}</a-button>
    <span
      :style="{marginLeft:'46px',marginRight:'46px',fontSize:'16px',color:'#999999',marginTop:'4px'}"
    >{{paleLabel}}</span>
    <a-button
      type="primary"
      :style="{width:'90px',marginRight:'auto'}"
      @click="onNextPage"
      :disabled="nextDisbaled"
    >{{$t("NextPage")}}</a-button>
    <div v-show="data.isShowMove" :style="{position: 'relative'}">
      <label
        :style="{marginRight:'20px',fontSize:'16px',color:'#999999',marginTop:'4px'}"
      >{{$t("MoveTo")}}</label>
      <a-select
        :style="{marginRight: '20px',fontSize:'16px',width:'140px'}"
        dropdownClassName="ak-select-item"
        v-model="data.moveToValue"
        :value="data.moveToValue"
        @change="onChange"
        :getPopupContainer="triggerNode => {return triggerNode.parentNode;}"
      >
        <a-select-option value="0">
          {{$t("AllContacts")}}
        </a-select-option>
        <a-select-option value="1">
          {{$t("BlackList")}}
        </a-select-option>
      </a-select>
    </div>
    <a-input-number
      :min="1"
      :max="totalPage"
      v-model="inputPage"
      :value="inputPage"
      :style="{width:'75px',color:'#878787',fontSize:'16px'}"
    />
   <a-button
      type="primary"
      :style="{width:'75px',marginLeft:'20px'}"
      @click="onGoPage"
    >{{$t("GoLbael")}}</a-button>
  </div>
</template>

<script>
import Vue from "vue";
import { Icon } from "ant-design-vue";
import iconFront from "../js/iconfont";
const IconFont = Icon.createFromIconfontCN({
  scriptUrl: iconFront,
});

Vue.component("MyIcon", IconFont);

export default {
  props: {
    data: Object,
  },
  computed: {
    paleLabel: function () {
      let label = this.data.curPage;
      let sumPage =
        this.data.sum == 0
          ? 1
          : Math.ceil(this.data.sum / this.data.pageNumber);
      return label + "/" + sumPage;
    },
    totalPage: function () {
      return this.data.sum == 0
        ? 1
        : Math.ceil(this.data.sum / this.data.pageNumber);
    },
    preDisabled: function () {
      return this.data.curPage <= 1;
    },
    nextDisbaled: function () {
      return (
        this.data.curPage >= Math.ceil(this.data.sum / this.data.pageNumber)
      );
    },
  },
  data() {
    return {
      inputPage: 1,
      moveValue: "0",
    };
  },
  mounted() {
    this.inputPage = this.data.curPage;
  },
  methods: {
    onGoPage: function () {
      this.onChangePage(this.inputPage);
    },
    onPrePage: function () {
      this.onChangePage(this.data.curPage - 1);
    },
    onNextPage: function () {
      this.onChangePage(this.data.curPage + 1);
    },
    onChangePage: function (page) {
      this.$emit("onPageChange", "");    
      if(page <= 0){
        page = 1;
      }  
      this.data.onPageChange(page);
    },
    onChange: function (value){
      if (value == "0"){
        this.data.moveToValue = "1";
      } else {
        this.data.moveToValue = "0";
      }
      this.$emit("moveChange","");
      this.data.moveChange(value);
    }
  },
};
</script>


<style lang="less" scoped>
.ak-common-table-footer {
  margin-top: 20px;
  display: flex;
}

.ak-common-table-footer-btn {
  display: flex;
  width: 130px;
  background: rgba(255, 243, 243, 1);
  border: 1px solid rgba(255, 99, 101, 1);
  border-radius: 5px;
  color: #f55b5f;
  font-size: 16px;
  padding-right: 0px;
  margin-right: 40px;
}
.ak-common-table-footer-btn-label {
  max-width: 86px;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 10px;
  padding-top: 3px;
  width: 100%;
  float: right;
}

.ak-common-table-footer-btn-icon {
  font-size: 20px;
  color: #f47d7d;
  margin-top: 6px;
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

<style lang="less" >
.ak-select-item {
  float: none;
  text-align: center;
}
.ant-select-dropdown-menu {
  overflow-y: overlay !important;
}
</style>