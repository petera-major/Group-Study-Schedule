// calendar.js
// Fetch and display calendar events
async function fetchCalendar() {
    const calendarDiv = document.getElementById('calendar');
    try {
        const response = await fetch('/events');
        const events = await response.json();

        if (events.length === 0) {
            calendarDiv.innerText = 'No sessions scheduled yet.';
        } else {
            calendarDiv.innerHTML = events.map(event => `
                <p>
                    <strong>Session:</strong> ${event.session_time}<br>
                    <strong>Email:</strong> ${event.email}<br>
                    <strong>Teacher:</strong> ${event.teacher_email}
                </p>
            `).join('');
        }
    } catch (error) {
        calendarDiv.innerText = 'Failed to load calendar events.';
        console.error(error);
    }
}

// Schedule a session
const scheduleForm = document.getElementById('schedule-form');
scheduleForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const sessionTime = document.getElementById('session-time').value;
    const teacherEmail = document.getElementById('teacher-email').value;

    try {
        const response = await fetch('/schedule-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, session_time: sessionTime, teacher_email: teacherEmail }),
        });

        if (response.ok) {
            alert('Session scheduled successfully!');
            fetchCalendar();
        } else {
            const message = await response.text();
            alert(`Error: ${message}`);
        }
    } catch (error) {
        alert('Failed to schedule session.');
        console.error(error);
    }
});

// Load calendar on page load
fetchCalendar();
