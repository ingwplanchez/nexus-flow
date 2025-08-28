// --- LÓGICA DE LA INTERFAZ Y COMUNICACIÓN CON EL SERVIDOR ---
// Nota: Asume que las funciones para interactuar con el backend ya existen.
// Si no tienes un servidor de backend, esta sección no funcionará.

// Función para obtener el CSRF Token de las cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Función para mostrar un mensaje de estado (éxito o error)
function showStatusMessage(message, isSuccess) {
    const statusDiv = document.getElementById('status-message');
    statusDiv.textContent = message;
    statusDiv.classList.remove('hidden', 'bg-red-500', 'bg-green-500');
    statusDiv.classList.add(isSuccess ? 'bg-green-500' : 'bg-red-500');
    statusDiv.style.display = 'block';
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}

// Función para mostrar un mensaje de carga
function showLoading(elementId) {
    document.getElementById(elementId).innerHTML = '<div class="flex items-center justify-center"><svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Cargando...</div>';
}

// Función genérica para enviar la solicitud al servidor de backend

// Función genérica para enviar la solicitud al servidor de backend local
async function callBackendApi(endpoint, data) {
    try {
        const response = await fetch(`/api/${endpoint}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken') // Añadimos el token CSRF
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error);
        }

        const result = await response.json();
        return result.result;
    } catch (error) {
        console.error('Error al llamar al servidor de backend:', error);
        showStatusMessage(`Ocurrió un error al procesar tu solicitud: ${error.message}`, false);
        return `Ocurrió un error al procesar tu solicitud: ${error.message}`;
    }
}

// Funciones para los botones de las herramientas


async function analyzeEisenhower() {
    const input = document.getElementById('eisenhower-input').value;
    if (!input) {
        showStatusMessage('Por favor, ingresa al menos una tarea para analizar.', false);
        return;
    }
    const resultDiv = document.getElementById('eisenhower-result');
    showLoading('eisenhower-result');
    const response = await callBackendApi('eisenhower', { task: input });
    resultDiv.innerHTML = `<pre class="whitespace-pre-wrap">${response}</pre>`;
    if (response && !response.startsWith('Ocurrió un error')) {
        showStatusMessage('Solicitud analizada con éxito.', true);
    }
}


async function analyzeLaborit() {
    const input = document.getElementById('laborit-input').value;
    if (!input) {
        showStatusMessage('Por favor, ingresa una lista de tareas para analizar.', false);
        return;
    }
    const resultDiv = document.getElementById('laborit-result');
    showLoading('laborit-result');
    const response = await callBackendApi('laborit', { tasks: input });
    resultDiv.innerHTML = `<pre class="whitespace-pre-wrap">${response}</pre>`;
    if (response && !response.startsWith('Ocurrió un error')) {
        showStatusMessage('Lista de tareas analizada con éxito.', true);
    }
}

async function analyzeYerkesDodson() {
    const input = document.getElementById('yerkes-dodson-input').value;
    if (!input) {
        showStatusMessage('Por favor, ingresa un plan diario para analizar.', false);
        return;
    }
    const resultDiv = document.getElementById('yerkes-dodson-result');
    showLoading('yerkes-dodson-result');
    const response = await callBackendApi('yerkes-dodson', { plan: input });
    resultDiv.innerHTML = `<pre class="whitespace-pre-wrap">${response}</pre>`;
    if (response && !response.startsWith('Ocurrió un error')) {
        showStatusMessage('Plan diario analizado con éxito.', true);
    }
}

// --- LÓGICA DE LA LISTA DE TAREAS ---
let draggedItem = null;
let currentFilter = 'all';

// Carga las tareas desde localStorage
function getTasks() {
    const tasks = localStorage.getItem('todoTasks');
    return tasks ? JSON.parse(tasks) : [];
}

// Guarda las tareas en localStorage
function saveTasks(tasks) {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

// Renderiza las tareas en el DOM con soporte para arrastrar y soltar
function renderTasks() {
    const todoList = document.getElementById('todo-list');
    const tasks = getTasks();
    todoList.innerHTML = '';

    let filteredTasks = tasks;
    if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    } else if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    }

    if (filteredTasks.length === 0) {
        todoList.innerHTML = '<p class="text-secondary text-center">No hay tareas en esta vista.</p>';
        return;
    }
    
    filteredTasks.forEach((task, index) => {
        const originalIndex = tasks.findIndex(t => t.text === task.text && t.completed === task.completed && t.dueDate === task.dueDate);
        
        const li = document.createElement('li');
        li.className = `p-4 rounded-lg shadow flex items-center justify-between transition-colors duration-300 todo-item`;
        if (task.completed) {
            li.classList.add('completed');
        }
        li.draggable = true;
        li.dataset.index = originalIndex;

        const dueDateHtml = task.dueDate ? `<span class="text-xs text-secondary ml-4">Fecha: ${new Date(task.dueDate).toLocaleDateString()}</span>` : '';
        
        //const dueDateText = task.dueDate ? `<span class="text-sm text-gray-500 dark:text-gray-400 ml-4 due-date-text">Fecha límite: ${formattedDueDate}</span>` : '';

        li.innerHTML = `
            <div class="flex items-center flex-grow">
                <input type="checkbox" ${task.completed ? 'checked' : ''} class="h-5 w-5 rounded text-teal-500 border-gray-300 dark:border-gray-600 focus:ring-teal-500 toggle-task-checkbox">
                <div class="flex flex-col ml-4 flex-grow">
                    <span class="text-primary task-text flex-grow">${task.text}</span>
                    ${dueDateHtml}
                    <input type="text" value="${task.text}" class="hidden flex-grow p-2 rounded-lg border border-teal-500 bg-container text-primary focus:outline-none task-input">
                    <input type="date" value="${task.dueDate || ''}" class="hidden p-2 rounded-lg border border-teal-500 bg-container text-primary focus:outline-none due-date-input">
                </div>
            </div>
            <div class="flex items-center space-x-2 ml-2">
                <button class="text-gray-500 hover:text-teal-500 transition-colors duration-200 edit-task-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232a2.5 2.5 0 013.536 3.536L6.5 21.036H3v-3.536l12.232-12.232zM15.232 5.232L18.768 8.768" /></svg>
                </button>
                <button class="text-red-500 hover:text-red-700 transition-colors duration-200 delete-task-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        `;
        
        todoList.appendChild(li);
    });
    // Una vez que se renderizan, se añaden los listeners
    addEventListeners();
}

function addEventListeners() {
    // Manejadores de eventos para los botones de la lista de tareas
    document.querySelectorAll('.toggle-task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const li = e.target.closest('.todo-item');
            const index = parseInt(li.dataset.index);
            toggleTask(index);
        });
    });

    document.querySelectorAll('.delete-task-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const li = e.target.closest('.todo-item');
            const index = parseInt(li.dataset.index);
            deleteTask(index);
        });
    });

    document.querySelectorAll('.edit-task-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const li = e.target.closest('.todo-item');
            const index = parseInt(li.dataset.index);
            toggleEditMode(li, index);
        });
    });

    // Manejadores de eventos para arrastrar y soltar
    const listItems = document.querySelectorAll('.todo-item');
    listItems.forEach(item => {
        item.addEventListener('dragstart', () => {
            draggedItem = item;
            setTimeout(() => item.classList.add('dragging'), 0);
        });

        item.addEventListener('dragend', () => {
            if (draggedItem) {
                draggedItem.classList.remove('dragging');
                draggedItem = null;
                // Re-renderizamos para actualizar los índices
                renderTasks();
            }
        });
    });

    const todoList = document.getElementById('todo-list');
    todoList.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(todoList, e.clientY);
        const draggingElement = document.querySelector('.dragging');
        if (draggingElement == null) return;

        if (afterElement == null) {
            todoList.appendChild(draggingElement);
        } else {
            todoList.insertBefore(draggingElement, afterElement);
        }
    });

    todoList.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggingElement = document.querySelector('.dragging');
        if (!draggingElement) return;

        const tasks = getTasks();
        const newOrder = Array.from(todoList.children).map(li => {
            const index = parseInt(li.dataset.index);
            return tasks[index];
        });

        saveTasks(newOrder);
        // No necesitamos llamar a renderTasks aquí, ya se hace en dragend
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.todo-item:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Actualiza la función addTask para manejar eventos
function addTask() {
    const newTaskInput = document.getElementById('new-task-input');
    const newDueDateInput = document.getElementById('due-date-input');
    const taskText = newTaskInput.value.trim();
    const dueDate = newDueDateInput.value;

    if (taskText) {
        const tasks = getTasks();
        tasks.push({
            text: taskText,
            completed: false,
            dueDate: dueDate || null
        });
        saveTasks(tasks);
        newTaskInput.value = '';
        newDueDateInput.value = '';
        renderTasks();
        //showStatusMessage('Tarea agregada con éxito.', true);
    } else {
        showStatusMessage('Por favor, ingresa una tarea.', false);
    }
}

function toggleTask(index) {
    const tasks = getTasks();
    if (tasks[index]) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks(tasks);
        renderTasks();
        //showStatusMessage('Estado de la tarea actualizado.', true);
    }
}

function deleteTask(index) {
    const tasks = getTasks();
    if (tasks[index]) {
        tasks.splice(index, 1);
        saveTasks(tasks);
        renderTasks();
        //showStatusMessage('Tarea eliminada con éxito.', true);
    }
}

function toggleEditMode(li, index) {
    const taskTextSpan = li.querySelector('.task-text');
    const taskTextInput = li.querySelector('.task-input');
    const dueDateSpan = li.querySelector('.due-date-text');
    const dueDatePicker = li.querySelector('.due-date-input');
    const editBtn = li.querySelector('.edit-task-btn');

    const isEditing = li.classList.toggle('editing');

    if (isEditing) {
        taskTextSpan.classList.add('hidden');
        taskTextInput.classList.remove('hidden');
        if (dueDateSpan) dueDateSpan.classList.add('hidden');
        if (dueDatePicker) dueDatePicker.classList.remove('hidden');
        taskTextInput.focus();
        editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>`;
    } else {
        const tasks = getTasks();
        const newText = taskTextInput.value.trim();
        const newDueDate = dueDatePicker.value;
        if (newText !== "") {
            tasks[index].text = newText;
            tasks[index].dueDate = newDueDate || null;
            saveTasks(tasks);
            renderTasks();
            //showStatusMessage('Tarea editada con éxito.', true);
        } else {
            showStatusMessage('La tarea no puede estar vacía.', false);
            li.classList.add('editing'); // Mantiene el modo de edición
        }
        editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232a2.5 2.5 0 013.536 3.536L6.5 21.036H3v-3.536l12.232-12.232zM15.232 5.232L18.768 8.768" /></svg>`;
    }
}

function clearCompletedTasks() {
    const tasks = getTasks();
    const incompleteTasks = tasks.filter(task => !task.completed);
    saveTasks(incompleteTasks);
    renderTasks();
    showStatusMessage('Se han limpiado las tareas completadas.', true);
}

async function copyTasks() {
    const tasks = getTasks();
    if (tasks.length === 0) {
        showStatusMessage('No hay tareas para copiar.', false);
        return;
    }
    const tasksText = tasks.map(task => `${task.text}${task.dueDate ? ' - ' + new Date(task.dueDate).toLocaleDateString() : ''}`).join('\n');
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(tasksText);
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = tasksText;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
        showStatusMessage('Tareas copiadas al portapapeles con éxito.', true);
    } catch (err) {
        console.error('Error al copiar el texto: ', err);
        showStatusMessage('Ocurrió un error al intentar copiar las tareas.', false);
    }
}

function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.todo-list-filters button').forEach(button => {
        button.classList.remove('bg-teal-500', 'text-white');
        button.classList.add('bg-secondary', 'text-primary');
    });
    const selectedButton = document.getElementById(`filter-${filter}`);
    if (selectedButton) {
        selectedButton.classList.remove('bg-secondary', 'text-primary');
        selectedButton.classList.add('bg-teal-500', 'text-white');
    }
    renderTasks();
}

// --- LÓGICA DE LAS PESTAÑAS (TABS) ---
function openTab(tabId) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.add('hidden'));

    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('border-purple-500', 'border-green-500', 'border-blue-500', 'border-teal-500', 'font-bold', 'hover:text-purple-500', 'hover:text-green-500', 'hover:text-blue-500', 'hover:text-teal-500');
        button.classList.add('border-transparent');
    });

    const selectedContent = document.getElementById(tabId);
    if (selectedContent) {
        selectedContent.classList.remove('hidden');
    }

    const selectedButton = document.getElementById('tab-' + tabId.replace('-content', ''));
    if (selectedButton) {
        let borderColor = '';
        let hoverColor = '';
        switch(tabId) {
            case 'eisenhower-content': borderColor = 'border-purple-500'; hoverColor = 'hover:text-purple-500'; break;
            case 'laborit-content': borderColor = 'border-green-500'; hoverColor = 'hover:text-green-500'; break;
            case 'yerkes-dodson-content': borderColor = 'border-blue-500'; hoverColor = 'hover:text-blue-500'; break;
            case 'todo-list-content': borderColor = 'border-teal-500'; hoverColor = 'hover:text-teal-500'; break;
        }
        selectedButton.classList.add(borderColor, 'font-bold');
        selectedButton.classList.remove('border-transparent');
        
        // Re-apply hover classes for non-active tabs
        tabButtons.forEach(button => {
            if (button !== selectedButton) {
                switch(button.id) {
                    case 'eisenhower-content': borderColor = 'border-purple-500'; break;
                    case 'laborit-content': borderColor = 'border-green-500'; break;
                    case 'yerkes-dodson-content': borderColor = 'border-blue-500'; break;
                    case 'todo-list-content': borderColor = 'border-teal-500'; break;
                }
            }
        });
    }
}

// LÓGICA DEL MODO OSCURO
const themeToggle = document.getElementById('theme-toggle');
const moonIcon = document.getElementById('moon-icon');
const sunIcon = document.getElementById('sun-icon');
const isDarkMode = localStorage.getItem('theme') === 'dark' || 
                    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
if (isDarkMode) {
    document.documentElement.classList.add('dark');
    moonIcon.classList.remove('hidden');
    sunIcon.classList.add('hidden');
} else {
    document.documentElement.classList.remove('dark');
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
}
themeToggle.addEventListener('click', () => {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        moonIcon.classList.remove('hidden');
        sunIcon.classList.add('hidden');
    }
    // Asegura que las tareas se vuelvan a renderizar para aplicar los nuevos estilos de color
    renderTasks();
});

// Eventos de carga
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-task-btn').addEventListener('click', addTask);
    document.getElementById('new-task-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    openTab('todo-list-content');
    renderTasks();
    setFilter(currentFilter); // Asegura que el botón de filtro inicial esté activo
});