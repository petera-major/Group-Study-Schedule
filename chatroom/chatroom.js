// Initialize Socket.IO
const socket = io(); // Connects to the backend

// Chat functionality
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendMessageButton = document.getElementById('sendMessageButton');

sendMessageButton.addEventListener('click', sendMessage);

socket.on('chat-message', (data) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${data.user_name}: ${data.content}`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    socket.emit('chat-message', { user_id: 1, user_name: 'User1', content: message });
    messageInput.value = '';
}

// Whiteboard functionality
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const lineWidthInput = document.getElementById('lineWidth');
const eraseButton = document.getElementById('eraseButton');

let drawing = false;
let currentMode = 'pen';
let lastX = 0, lastY = 0;

function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

eraseButton.addEventListener('click', () => {
    currentMode = currentMode === 'erase' ? 'pen' : 'erase';
    eraseButton.textContent = currentMode === 'erase' ? 'Switch to Pen' : 'Switch to Erase';
});

canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;

    const currentX = e.offsetX;
    const currentY = e.offsetY;

    if (currentMode === 'pen') {
        ctx.strokeStyle = colorPicker.value;
        ctx.lineWidth = lineWidthInput.value;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();

        socket.emit('draw', { lastX, lastY, currentX, currentY, color: ctx.strokeStyle, width: ctx.lineWidth });
    } else {
        ctx.clearRect(currentX - 5, currentY - 5, 10, 10);
    }

    [lastX, lastY] = [currentX, currentY];
});

canvas.addEventListener('mouseup', () => (drawing = false));
canvas.addEventListener('mouseout', () => (drawing = false));

socket.on('draw', (data) => {
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.width;

    ctx.beginPath();
    ctx.moveTo(data.lastX, data.lastY);
    ctx.lineTo(data.currentX, data.currentY);
    ctx.stroke();
});

// Speech-to-text
const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new speechRecognition();
recognition.lang = 'en-US';

document.getElementById('speechToTextButton').addEventListener('click', () => recognition.start());
recognition.onresult = (event) => {
    messageInput.value = event.results[0][0].transcript;
};
recognition.onerror = (event) => console.error('Speech recognition error:', event.error);

colorPicker.addEventListener('input', (e) => {
    ctx.strokeStyle = e.target.value;
});

lineWidthInput.addEventListener('input', (e) => {
    ctx.lineWidth = e.target.value;
});
