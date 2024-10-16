<template>
    <div class="contentContainer">
      <div class="leftContainer" ref="leftContainerDom">
        <img :src="leftSrc" alt="设备树列表" width="100%" height="100%" />
        <div style="width: 80%; height: 7%; position: absolute; top: 33%; left: 4%; cursor: pointer;" @click="handleClick('left', 'deviceTreeList')"></div>
      </div>
      <div class="centerContainer" ref="centerContainerDom">
        <img :src="propUpSrc" alt="弹窗信息" width="100%" height="100%" />
        <div style="width: 24%; height: 9%; position: absolute; top: 0px; left: 11%; cursor: pointer;" @click="handleClick('center', 'monitorInfo')"></div>
        <div style="width: 24%; height: 9%; position: absolute; top: 0px; left: 38%; cursor: pointer;" @click="handleClick('center', 'diveceInfo')"></div>
        <div style="width: 24%; height: 9%; position: absolute; top: 0px; left: 67%; cursor: pointer;" @click="handleClick('center', 'assetInfo')"></div>
      </div>
      <div class="bottomContainer">
        <img :src="bottomSrc" alt="底部菜单" width="100%" height="100%" />
        <div style="width: 8%; height: 65%; position: absolute; top: 0px; left: 59%; cursor: pointer;" @click="handleClick('bottom', 'protective')"></div>
        <div style="width: 8%; height: 65%; position: absolute; top: 0px; left: 31%; cursor: pointer;" @click="handleClick('bottom', 'allStation')"></div>
      </div>
      <div class="rightContainer">
        <img :src="rightSrc" alt="右侧菜单" width="100%" height="100%" />
        <div style="width: 33%; height: 5%; position: absolute; top: 22%; left: 35%; cursor: pointer;" @click="handleClick('right', 'lengthMeasure')"></div>
        <div style="width: 33%; height: 5%; position: absolute; top: 31%; left: 30%; cursor: pointer;" @click="handleClick('right', 'areaMeasure')"></div>
        <div style="width: 33%; height: 5%; position: absolute; top: 39%; left: 27%; cursor: pointer;" @click="handleClick('right', 'horizontalMeasure')"></div>
        <div style="width: 33%; height: 5%; position: absolute; top: 48%; left: 21%; cursor: pointer;" @click="handleClick('right', 'verticalMeasure')"></div>
        <div style="width: 33%; height: 5%; position: absolute; bottom: 39%; left: 26%; cursor: pointer;" @click="handleClick('right', 'deviceTree')"></div>
        <div style="width: 33%; height: 5%; position: absolute; bottom: 30%; left: 29%; cursor: pointer;" @click="handleClick('right', 'viewer')"></div>
        <div style="width: 33%; height: 5%; position: absolute; bottom: 22%; left: 35%; cursor: pointer;" @click="handleClick('right', 'index')"></div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, toRef, onMounted } from 'vue';
  import { emitter, EmitterEvent } from '@/utils/mitt';
  // 弹窗
  import propUpSrc1 from '../../assets/centerMenu/monitorInfo.png';
  // 底部菜单
  import bottomMenuSrc1 from '../../assets/bottomMenu/allStation.png';
  // 右侧菜单
  import rightMenuSrc1 from '../../assets/rightMenu/右侧菜单.png';
  // 左侧
  import leftSrc from '../../assets/deviceTreeList.png';
  
  let propUpSrc = toRef(propUpSrc1);
  let bottomSrc = toRef(bottomMenuSrc1);
  let rightSrc = toRef(rightMenuSrc1);
  
  const leftContainerDom = ref(null);
  const centerContainerDom = ref(null);

  const handleClick = (type, value) => {
    if (type === 'left') {
      propUpSrc.value = propUpSrc1;
      centerContainerDom.value.style.display = 'block';
    } else if (type === 'center') {
      propUpSrc.value =  `/assets/${type}Menu/${value}.png`;
      leftContainerDom.value.style.display = 'block';
    } else if (type === 'right') { 
      rightSrc.value = `/assets/${type}Menu/${value}.png`;
      leftContainerDom.value.style.display = 'none';
      centerContainerDom.value.style.display = 'none';
      // 点击设备树出现左侧列表
      if (value === 'deviceTree') {
        leftContainerDom.value.style.display = 'block';
      }
    } else if (type === 'bottom') {
      bottomSrc.value = `/assets/${type}Menu/${value}.png`;
      leftContainerDom.value.style.display = 'none';
      centerContainerDom.value.style.display = 'none';
      rightSrc.value = rightMenuSrc1;
    }
  }  

  onMounted(() => {
    emitter.on(EmitterEvent.openMonitorInfo, () => {
      
    })
  })
  </script>
  
  <style scoped lang="scss">
  .contentContainer {
    position: absolute;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    .leftContainer {
      position: absolute;
      top: 40px;
      left: 40px;
      height: 54%;
      width: 20%;
      display: none;
      z-index: 1;
    }
    .centerContainer {
      position: absolute;
      left: 40%;
      top: 110px;
      width: 22%;
      height: 43%;
      display: none;
      z-index: 1;
    }
    .bottomContainer {
      position: absolute;
      bottom: 0;
      left: 20%;
      width: 62%;
      z-index: 1;
    }
    .rightContainer {
      position: absolute;
      top: 0;
      right: -56px;
      height: 100%;
      width: 20%;
      z-index: 1;
    }
  }
  </style>