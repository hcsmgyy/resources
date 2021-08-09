<template>
    <div class="ak-processing-modal-div" v-if="this.$root.processingVisible">
        <a-modal 
            :visible="true"
            :centered="true"
            :closable="false"
            :footer="null"
        >
            <div class="ak-processing-content">
                <MyIcon type="iconstop" class="ak-processing-icon"></MyIcon>
                <label class="ak-processing-modal-label">{{this.$t('Processing')}} {{this.labelValue}}</label>
            </div>
        </a-modal>
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
  data() {
      return{
        dotNumArr:[0],
        dotTxtArr:[""],
        labelValue: "",
        interObj: Object,
      }
  },
  created() {
      this.interObj = setInterval(() =>{
       showLabel(this);
    }, 500);
  },
};

var labelValue = "";
function showLabel(vm){
    if(vm.dotNumArr[0] > 3){
      vm.dotNumArr[0] = 0;
      vm.dotTxtArr[0] = "";
    }
    vm.labelValue = vm.dotTxtArr[0];
    vm.dotTxtArr[0] += ".";
    vm.dotNumArr[0]++;
}
</script>

<style lang="less" scoped>
/deep/.ant-modal-content{
    width: 950px;
    height: 210px;
    border-radius: 10px;
}

/deep/.ant-modal-body{
    height: 100%;
    display: flex;
    align-items: center;
}

.ak-processing-icon{
    margin-left: 201px;
    font-size: 92px;
    color: #FE7B24;
    vertical-align:middle;
}

.ak-processing-modal-label{
    font-size: 32px;
    margin-left: 47px;
    vertical-align: middle;
}
</style>