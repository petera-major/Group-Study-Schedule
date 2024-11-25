// Javascriot for frontend chatroom with whiteboard
// Initialize Socket.IO
const socket = io(); // Connects to the backend

// Chat functionality
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendMessageButton = document.getElementById('sendMessageButton');

sendMessageButton.addEventListener('click', sendMessage);

socket.on('chat-message', (data) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${data.user_name}: ${data.content}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight; 
});

function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    const user_id = 1; 
    const user_name = 'User1'; 

    socket.emit('chat-message', { user_id, user_name, content: message });
    chatInput.value = ''; 

// Whiteboard functionality
const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const lineWidthInput = document.getElementById('lineWidth');

canvas.width = 500;
canvas.height = 300;

let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Set default color and line width
ctx.strokeStyle = colorPicker.value;
ctx.lineWidth = lineWidthInput.value;

// Emit draw data
function emitDrawData(drawData) {
    socket.emit('draw', drawData);
}

// Handle drawing locally and send data to server
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;

    const currentX = e.offsetX;
    const currentY = e.offsetY;

    ctx.strokeStyle = colorPicker.value; // Update color
    ctx.lineWidth = lineWidthInput.value; // Update line width
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    emitDrawData({ lastX, lastY, currentX, currentY, color: ctx.strokeStyle, width: ctx.lineWidth });
    [lastX, lastY] = [currentX, currentY];
});

canvas.addEventListener('mouseup', () => (isDrawing = false));
canvas.addEventListener('mouseout', () => (isDrawing = false));

// Handle clear button
document.querySelector('button[onclick="clearWhiteboard()"]').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear-whiteboard'); // Notify server
});

// Receive drawing data from other clients
socket.on('draw', (drawData) => {
    ctx.strokeStyle = drawData.color;
    ctx.lineWidth = drawData.width;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(drawData.lastX, drawData.lastY);
    ctx.lineTo(drawData.currentX, drawData.currentY);
    ctx.stroke();
});

// Receive clear event
socket.on('clear-whiteboard', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
// Initialize SpeechRecognition API
const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new speechRecognition();
recognition.continuous = false; // Stop after the first phrase
recognition.lang = 'en-US'; // Set language to English

// Speech-to-text button functionality
const speechButton = document.getElementById('speechButton');

speechButton.addEventListener('click', () => {
    recognition.start(); // Start the speech recognition
});

// Handle the result from speech recognition
recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    chatInput.value = transcript; // Set the text in the chat input field
};

// Handle any errors
recognition.onerror = function(event) {
    console.error('Speech recognition error:', event.error);
};

// Handle color change
colorPicker.addEventListener('input', (e) => {
    ctx.strokeStyle = e.target.value; // Update stroke color
});

// Handle line width change
lineWidthInput.addEventListener('input', (e) => {
    ctx.lineWidth = e.target.value; // Update line width
});
