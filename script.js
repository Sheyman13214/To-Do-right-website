// To-Do List functionality
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const voiceInputBtn = document.getElementById('voice-input-btn');

todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTodo(todoInput.value);
    todoInput.value = '';
});

function addTodo(text) {
    const li = document.createElement('li');
    li.innerHTML = `
        ${text}
        <button onclick="this.parentElement.remove()">Delete</button>
    `;
    todoList.appendChild(li);
}

// Voice Input functionality
voiceInputBtn.addEventListener('click', () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';

    recognition.start();

    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        todoInput.value = text;
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
    };
});

// Calendar functionality
const calendarBody = document.getElementById('calendar-body');
const currentMonthElement = document.getElementById('current-month');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

let currentDate = new Date();

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    currentMonthElement.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    calendarBody.innerHTML = '';

    for (let i = 0; i < firstDay.getDay(); i++) {
        calendarBody.appendChild(document.createElement('div'));
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        dayElement.textContent = day;
        dayElement.addEventListener('click', () => toggleActiveDay(dayElement));
        calendarBody.appendChild(dayElement);
    }
}

function toggleActiveDay(dayElement) {
    dayElement.classList.toggle('active');
}

prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

renderCalendar();
