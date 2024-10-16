<template>
  <div class="app">
    <panelPage></panelPage>
    <div id="viewer-container"></div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import panelPage from './components/panelPage.vue';
import CesiumMeasure from './js/CesiumMeasure.js'
import { LCCRender } from "../sdk/lcc-0.3.1.js";
import SceneManager from "./js/SceneManager.js";

onMounted(() => {
  const scene = new SceneManager({
    dom: "viewer-container"
  });
  window.scene = scene;
  const viewer = scene.viewer;
  let measure = new Cesium.Measure(viewer)
})

</script>

<style scoped lang="scss">
</style>