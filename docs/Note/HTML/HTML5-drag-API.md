# HTMLElement：drag 事件

::: info drag 事件
在用户拖动元素或选择的文本时，每隔几百毫秒就会被触发一次。
:::

## 被拖动元素设置 draggable

```html
<div class="dropzone">
  <div id="draggable" draggable="true">这个 div 可以拖动</div>
</div>
<div class="dropzone" id="droptarget"></div>
```

## 事件

- dragstart：事件主体是被拖放元素，在开始拖放被拖放元素时触发。
- drag：事件主体是被拖放元素，在正在拖放被拖放元素时触发。
- dragenter：事件主体是目标元素，在被拖放元素进入某元素时触发，也就是事件仅在被拖放元素首次进入目标元素时触发一次，一般需要阻止默认行为(`event.preventDefault()`)。
- dragover：事件主体是目标元素，在被拖放元素在某元素内移动时触发，事件会在被拖放元素在目标元素上时持续触发，一般需要阻止默认行为(`event.preventDefault()`)。
- dragleave：事件主体是目标元素，在被拖放元素移出目标元素时触发。
- drop：事件主体是目标元素，在目标元素完全接受被拖放元素时触发。
- dragend：事件主体是被拖放元素，在整个拖放操作结束时触发。
- [此处有案例](https://gitee.com/yin-haihong-1/drag-and-drop-course-schedule)
