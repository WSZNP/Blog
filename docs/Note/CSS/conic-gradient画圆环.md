# CSS 画渐变圆环

## 实现流程

1. 主要依靠 CSS 的 conic-gradient 属性，创建渐变圆环
2. 有渐变圆环后再使用伪元素创建白色背景

```html
<div class="app">
  <div class="ring-chart"></div>
  <div class="ring-chart ring-chart1"></div>
  <div class="ring-chart ring-chart2"></div>
</div>

<style lang="scss" scoped>
  .app {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .ring-chart {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      position: relative;

      background: conic-gradient(
        #f8766f 0.125turn,
        #69cd90 0.125turn 0.5turn,
        #ffb800 0.5turn
      );

      margin-bottom: 10px;
    }
    .ring-chart1::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #fff;
    }
    .ring-chart2 {
      -webkit-mask: radial-gradient(transparent 30px, red 30px 50px);
    }
  }
</style>
```

<div class="app">
  <div class="ring-chart"></div>
  <div class="ring-chart ring-chart1"></div>
  <div class="ring-chart ring-chart2"></div>
</div>

<style lang="scss" scoped>
	.app{
    display: flex;
    justify-content: space-between;
    align-items: center;

 		.ring-chart{
 		   width: 100px;
 		   height: 100px;
 		   border-radius: 50%;
 		   position: relative;

 		   background: conic-gradient( 
 		    #F8766F 0.125turn, 
 		    #69CD90 0.125turn 0.5turn, 
 		    #FFB800 0.5turn
 		   );

 		   margin-bottom: 10px;
 		 }  
 		 .ring-chart1::before{
 		   content: '';
 		   position: absolute;
 		   top: 50%;
 		   left: 50%;
 		   transform: translate(-50%, -50%); 
 		   width: 60px;
 		   height: 60px;
 		   border-radius: 50%;
 		   background: #fff;
 		 }  
 		 .ring-chart2{
 		   -webkit-mask: radial-gradient(
 		     transparent 30px, 
 		     red 30px 50px, 
 		   );
 		 }  
	}
 
  
</style>
