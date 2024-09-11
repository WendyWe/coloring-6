// 獲取 DOM 元素
const backgroundCanvas = document.getElementById('backgroundCanvas');
const backgroundCtx = backgroundCanvas.getContext('2d');

const drawingCanvas = document.getElementById('drawingCanvas');
const drawingCtx = drawingCanvas.getContext('2d');

const colorButtons = document.querySelectorAll('.color-btn');
const resetButton = document.getElementById('reset-btn');
const saveButton = document.getElementById('save-btn');
const undoButton = document.getElementById('undo-btn');
const eraserButton = document.getElementById('eraser-btn'); // 獲取橡皮擦按鈕
const customColorPicker = document.getElementById('custom-color-picker');
const brushSizeInput = document.getElementById('brush-size');

let currentColor = 'black'; // 默認顏色
let isDrawing = false; // 用於檢查是否正在繪製
let brushSize = 10; // 默認畫筆粗細
let lastX, lastY; // 儲存滑鼠座標
let undoStack = []; // 儲存畫布狀態的堆疊
let isEraser = false; // 檢查是否為橡皮擦模式

// 設置固定背景圖像
const img = new Image();
img.src = '06.jpg';  // 這裡將圖片地址替換為你的固定圖片地址
img.onload = function () {
  backgroundCtx.drawImage(img, 0, 0, backgroundCanvas.width, backgroundCanvas.height);
};

// 設置顏色選擇功能
colorButtons.forEach(button => {
  button.addEventListener('click', () => {
    colorButtons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    currentColor = button.style.backgroundColor;
    isEraser = false;  // 切換回畫筆模式
  });
});

// 自定義顏色選擇器
customColorPicker.addEventListener('input', () => {
  colorButtons.forEach(btn => btn.classList.remove('selected'));
  currentColor = customColorPicker.value;
  isEraser = false;  // 切換回畫筆模式
});

// 畫筆粗細控制
brushSizeInput.addEventListener('input', () => {
  brushSize = brushSizeInput.value;
});

// 橡皮擦功能
eraserButton.addEventListener('click', () => {
  isEraser = true;  // 啟用橡皮擦模式
});

// 繪畫事件
drawingCanvas.addEventListener('mousedown', (event) => {
  saveState(); // 保存當前狀態到堆疊
  const { x, y } = getMousePos(event);
  isDrawing = true;
  lastX = x;
  lastY = y;
  draw(event);
});

drawingCanvas.addEventListener('mousemove', (event) => {
  if (isDrawing) {
    draw(event);
  }
});

drawingCanvas.addEventListener('mouseup', () => {
  isDrawing = false;
});

drawingCanvas.addEventListener('mouseout', () => {
  isDrawing = false;
});

// 繪畫功能
function draw(event) {
  const { x, y } = getMousePos(event);

  if (isEraser) {
    // 使用全透明擦除模式
    drawingCtx.globalCompositeOperation = 'destination-out';  // 使用擦除模式
    drawingCtx.strokeStyle = 'rgba(0,0,0,1)';  // 這裡顏色可以忽略
  } else {
    drawingCtx.globalCompositeOperation = 'source-over';  // 回到普通繪圖模式
    drawingCtx.strokeStyle = currentColor;
  }
  
  drawingCtx.lineWidth = brushSize;
  drawingCtx.lineCap = 'round';

  drawingCtx.beginPath();
  drawingCtx.moveTo(lastX, lastY);
  drawingCtx.lineTo(x, y);
  drawingCtx.stroke();

  lastX = x;
  lastY = y;
}

// 轉換滑鼠座標
function getMousePos(event) {
  const rect = drawingCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return { x, y };
}

// 撤銷功能
undoButton.addEventListener('click', () => {
  if (undoStack.length > 0) {
    const prevState = undoStack.pop();
    const img = new Image();
    img.onload = function () {
      drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
      drawingCtx.drawImage(img, 0, 0);
    };
    img.src = prevState;
  }
});

// 保存當前畫布狀態到堆疊
function saveState() {
  const dataURL = drawingCanvas.toDataURL();
  undoStack.push(dataURL);
}

// 重置畫布
resetButton.addEventListener('click', () => {
  // 清空繪畫畫布
  drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
});

// 保存畫布內容為圖片
saveButton.addEventListener('click', () => {
  const combinedCanvas = document.createElement('canvas');
  combinedCanvas.width = backgroundCanvas.width;
  combinedCanvas.height = backgroundCanvas.height;
  const combinedCtx = combinedCanvas.getContext('2d');

  // 繪製背景圖片
  combinedCtx.drawImage(backgroundCanvas, 0, 0);
  // 繪製繪畫層
  combinedCtx.drawImage(drawingCanvas, 0, 0);

  const dataURL = combinedCanvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = 'my_coloring.png';
  a.click();
});
