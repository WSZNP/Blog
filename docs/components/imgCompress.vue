<template>
  <div class="app">
    <div class="util">
      <input type="file" name="" id="file" />
      <button class="green" onclick="file.click()">选择要压缩的图片</button>
      <button class="yellow" id="btn" @click="handleCompress">压缩</button>
    </div>
    <div class="canvas-box">
      <canvas id="canvas" width="300" height="300"></canvas>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue';

const img = ref(null);
const isSelect = ref(false);

onMounted(() => {
  let file = document.getElementById('file');
  let canvas = document.getElementById('canvas');
  file.addEventListener(
    'change',
    function (e) {
      isSelect.value = true;
      let file = e.target.files[0];
      let reader = new FileReader();
      //转为base64
      reader.readAsDataURL(file);
      reader.onload = e => {
        img.value = new Image();
        img.value.src = e.target.result;
        img.value.onload = function () {
          // 计算缩放比例,避免页面上无法显示
          const scale = Math.min(
            canvas.width / img.value.width,
            canvas.height / img.value.height
          );
          const width = img.value.width * scale * devicePixelRatio;
          const height = img.value.height * scale * devicePixelRatio;
          canvas.width = width;
          canvas.height = height;
          let ctx = canvas.getContext('2d');
          ctx.drawImage(img.value, 0, 0, width, height);
        };
      };
    },
    false
  );
});

function handleCompress() {
  if (!isSelect.value) {
    alert('请先选择要压缩的图片');
    return;
  }
  //预览画板被缩放过，需要重新创建画板
  const canvas2 = document.createElement('canvas');
  const ctx2 = canvas2.getContext('2d');
  const width = img.value.width * devicePixelRatio;
  const height = img.value.height * devicePixelRatio;
  canvas2.width = width;
  canvas2.height = height;
  ctx2.drawImage(img.value, 0, 0, width, height);

  const dataUrl = canvas2.toDataURL('image/jpeg', 0.8);
  const line = document.createElement('a');
  line.href = dataUrl;
  line.download = 'compress.jpg';
  line.click();
  isSelect.value = false;
}
</script>
<style scoped lang="scss">
.util {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.canvas-box {
  display: flex;
  justify-content: center;
}
#file {
  display: none;
}

button {
  width: 120px;
  line-height: 38px;
  text-align: center;
  font-weight: bold;
  color: #fff;
  text-shadow: 1px 1px 1px #333;
  border-radius: 5px;
  margin: 5px 20px 20px 0;
  position: relative;
  overflow: hidden;

  &.green {
    border: 1px solid #64c878;
    box-shadow: 0 1px 2px #b9ecc4 inset, 0 -1px 0 #6c9f76 inset,
      0 -2px 3px #b9ecc4 inset;
    background: -webkit-linear-gradient(top, #90dfa2, #84d494);
    background: -moz-linear-gradient(top, #90dfa2, #84d494);
    background: linear-gradient(top, #90dfa2, #84d494);
  }

  &.yellow {
    border: 1px solid #d2a000;
    box-shadow: 0 1px 2px #fedd71 inset, 0 -1px 0 #a38b39 inset,
      0 -2px 3px #fedd71 inset;
    background: -webkit-linear-gradient(top, #fece34, #d8a605);
    background: -moz-linear-gradient(top, #fece34, #d8a605);
    background: linear-gradient(top, #fece34, #d8a605);
  }
}
</style>
