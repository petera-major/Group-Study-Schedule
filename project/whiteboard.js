const whiteboardCanvas = document.getElementById('whiteboardCanvas');
if (whiteboardCanvas) {
    console.log('Initializing Whiteboard');

    const ctx = whiteboardCanvas.getContext('2d');
    const colorPicker = document.getElementById('colorPicker');
    const lineWidth = document.getElementById('lineWidth');
    const clearButton = document.getElementById('clearButton');

    let drawing = false;
    let lastX = 0, lastY = 0;

    function resizeCanvas() {
        whiteboardCanvas.width = whiteboardCanvas.parentElement.clientWidth;
        whiteboardCanvas.height = whiteboardCanvas.parentElement.clientHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    whiteboardCanvas.addEventListener('mousedown', (e) => {
        drawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    });

    whiteboardCanvas.addEventListener('mousemove', (e) => {
        if (!drawing) return;
        ctx.strokeStyle = colorPicker.value;
        ctx.lineWidth = lineWidth.value;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();

        socket.emit('draw', {
            lastX,
            lastY,
            currentX: e.offsetX,
            currentY: e.offsetY,
            color: colorPicker.value,
            width: lineWidth.value
        });

        [lastX, lastY] = [e.offsetX, e.offsetY];
    });

    whiteboardCanvas.addEventListener('mouseup', () => (drawing = false));
    whiteboardCanvas.addEventListener('mouseout', () => (drawing = false));

    socket.on('draw', (data) => {
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.width;

        ctx.beginPath();
        ctx.moveTo(data.lastX, data.lastY);
        ctx.lineTo(data.currentX, data.currentY);
        ctx.stroke();
    });

    clearButton.addEventListener('click', () => {
        ctx.clearRect(0, 0, whiteboardCanvas.width, whiteboardCanvas.height);
        socket.emit('clear-whiteboard');
    });

    socket.on('clear-whiteboard', () => {
        ctx.clearRect(0, 0, whiteboardCanvas.width, whiteboardCanvas.height);
    });
}