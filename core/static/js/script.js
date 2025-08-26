// --- LÓGICA DE LA INTERFAZ Y COMUNICACIÓN CON EL SERVIDOR ---

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
    }, 5000); // El mensaje desaparece después de 5 segundos
}

// Función para mostrar un mensaje de carga
function showLoading(elementId) {
    document.getElementById(elementId).innerHTML = '<div class="flex items-center justify-center"><svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Cargando...</div>';
}

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

// Función para el botón de la Matriz de Eisenhower
async function analyzeEisenhower() {
    const input = document.getElementById('eisenhower-input').value;
    if (!input) {
        showStatusMessage('Por favor, ingresa una tarea para analizar.', false);
        return;
    }
    const resultDiv = document.getElementById('eisenhower-result');
    showLoading('eisenhower-result');
    
    const response = await callBackendApi('eisenhower', { task: input });
    resultDiv.innerHTML = `<pre class="whitespace-pre-wrap">${response}</pre>`;
    if (response && !response.startsWith('Ocurrió un error')) {
        showStatusMessage('Tarea analizada con éxito.', true);
    }
}

// Función para el botón de la Ley de Laborit
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

// Función para el botón de la Ley de Yerkes-Dodson
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

// --- NUEVAS FUNCIONES PARA LA LISTA DE TAREAS ---

// Carga las tareas desde localStorage
function getTasks() {
    const tasks = localStorage.getItem('todoTasks');
    return tasks ? JSON.parse(tasks) : [];
}

// Guarda las tareas en localStorage
function saveTasks(tasks) {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

// Renderiza las tareas en el DOM
function renderTasks() {
    const todoList = document.getElementById('todo-list');
    const tasks = getTasks();
    todoList.innerHTML = ''; // Limpia la lista actual
    
    if (tasks.length === 0) {
        todoList.innerHTML = '<p class="text-secondary text-center">No tienes tareas pendientes. ¡Hora de agregar una!</p>';
        return;
    }

    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = `p-4 rounded-lg shadow flex items-center justify-between ${task.completed ? 'bg-gray-400 dark:bg-gray-600' : 'bg-secondary'} transition-colors duration-300`;
        li.classList.add('todo-item');
        if (task.completed) {
            li.classList.add('completed');
        }

        // Usamos un span para el texto de la tarea y un input para la edición
        li.innerHTML = `
            <div class="flex items-center flex-grow">
                <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${index})" class="h-5 w-5 rounded text-teal-600 border-gray-300 focus:ring-teal-500">
                <span id="task-text-${index}" class="ml-4 text-primary task-text flex-grow">${task.text}</span>
                <input id="task-input-${index}" type="text" value="${task.text}" class="hidden flex-grow p-2 ml-4 rounded-lg border border-teal-500 bg-container text-primary focus:outline-none">
            </div>
            <div class="flex items-center space-x-2 ml-2">
                <!-- Botón de edición/guardado -->
                <button id="edit-btn-${index}" onclick="toggleEditMode(${index})" class="text-gray-500 hover:text-teal-500 transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232a2.5 2.5 0 013.536 3.536L6.5 21.036H3v-3.536l12.232-12.232zM15.232 5.232L18.768 8.768" />
                    </svg>
                </button>
                <!-- Botón de eliminación -->
                <button onclick="deleteTask(${index})" class="text-red-500 hover:text-red-700 transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        `;
        todoList.appendChild(li);
    });
}

// Agrega una nueva tarea a la lista
function addTask() {
    const input = document.getElementById('new-task-input');
    const taskText = input.value.trim();
    if (taskText === '') {
        showStatusMessage('Por favor, escribe una tarea para agregar.', false);
        return;
    }
    
    const tasks = getTasks();
    tasks.push({ text: taskText, completed: false });
    saveTasks(tasks);
    renderTasks();
    input.value = ''; // Limpia el input
    showStatusMessage('Tarea agregada con éxito.', true);
}

// Marca una tarea como completada/incompleta
function toggleTask(index) {
    const tasks = getTasks();
    tasks[index].completed = !tasks[index].completed;
    saveTasks(tasks);
    renderTasks();
}

// Elimina una tarea de la lista
function deleteTask(index) {
    const tasks = getTasks();
    tasks.splice(index, 1);
    saveTasks(tasks);
    renderTasks();
    showStatusMessage('Tarea eliminada con éxito.', true);
}

// Función para alternar entre el modo de visualización y edición
function toggleEditMode(index) {
    const taskTextSpan = document.getElementById(`task-text-${index}`);
    const taskInput = document.getElementById(`task-input-${index}`);
    const editBtn = document.getElementById(`edit-btn-${index}`);
    
    // Si está en modo de edición, guardamos la tarea
    if (taskInput.classList.contains('hidden')) {
        // Modo de edición activado
        taskTextSpan.classList.add('hidden');
        taskInput.classList.remove('hidden');
        taskInput.focus();
        
        // Cambiamos el icono a un disquete (guardar) y la función onclick
        editBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
        `;
        editBtn.onclick = () => saveTask(index);

    } else {
        // Modo de visualización activado (guardado)
        const newText = taskInput.value.trim();
        if (newText === '') {
            showStatusMessage('El texto de la tarea no puede estar vacío.', false);
            taskInput.focus();
            return;
        }

        const tasks = getTasks();
        tasks[index].text = newText;
        saveTasks(tasks);
        renderTasks();
        showStatusMessage('Tarea editada con éxito.', true);
    }
}

// Guarda la tarea editada. Esta función se llama desde toggleEditMode.
function saveTask(index) {
    // El toggleEditMode ya contiene la lógica de guardado,
    // por lo que simplemente volvemos a llamarlo para que se encargue del proceso.
    toggleEditMode(index);
}

// Limpia todas las tareas completadas
function clearCompletedTasks() {
    const tasks = getTasks();
    const incompleteTasks = tasks.filter(task => !task.completed);
    saveTasks(incompleteTasks);
    renderTasks();
    showStatusMessage('Tareas completadas limpiadas.', true);
}

// --- NUEVA FUNCIÓN PARA COPIAR TODAS LAS TAREAS ---
async function copyTasks() {
    const tasks = getTasks();
    if (tasks.length === 0) {
        showStatusMessage('No hay tareas para copiar.', false);
        return;
    }

    // Mapea las tareas a una lista de cadenas de texto y únelas con saltos de línea
    const tasksText = tasks.map(task => task.text).join('\n');

    try {
        // Usa la API de Portapapeles para escribir el texto
        // Usamos `document.execCommand` como respaldo por si `navigator.clipboard` falla
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(tasksText);
        } else {
            // Fallback para navegadores antiguos
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


// --- LÓGICA DE LAS PESTAÑAS (TABS) ---
function openTab(tabId) {
    // Oculta todos los contenidos de las pestañas
    const tabContents = document.querySelectorAll('[id$="-content"]');
    tabContents.forEach(content => content.classList.add('hidden'));

    // Quita el estilo de "activo" de todos los botones de pestañas
    const tabButtons = document.querySelectorAll('button[id^="tab-"]');
    tabButtons.forEach(button => {
        button.classList.remove('border-purple-500', 'border-green-500', 'border-blue-500', 'border-teal-500', 'font-bold');
        button.classList.add('border-transparent');
    });

    // Muestra el contenido de la pestaña seleccionada
    const selectedContent = document.getElementById(tabId);
    if (selectedContent) {
        selectedContent.classList.remove('hidden');
    }

    // Agrega el estilo de "activo" al botón de la pestaña seleccionada
    const selectedButton = document.getElementById('tab-' + tabId.replace('-content', ''));
    if (selectedButton) {
        let borderColor = 'border-purple-500';
        switch(tabId) {
            case 'eisenhower-content': borderColor = 'border-purple-500'; break;
            case 'laborit-content': borderColor = 'border-green-500'; break;
            case 'yerkes-dodson-content': borderColor = 'border-blue-500'; break;
            case 'todo-list-content': borderColor = 'border-teal-500'; break;
        }
        selectedButton.classList.add(borderColor, 'font-bold');
        selectedButton.classList.remove('border-transparent');
    }
}

// LÓGICA DEL MODO OSCURO
const themeToggle = document.getElementById('theme-toggle');
const moonIcon = document.getElementById('moon-icon');
const sunIcon = document.getElementById('sun-icon');

// Verificar la preferencia de tema del sistema o del localStorage
const isDarkMode = localStorage.getItem('theme') === 'dark' || 
                            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

// Establecer la clase inicial y los iconos
if (isDarkMode) {
    document.documentElement.classList.add('dark');
    moonIcon.classList.remove('hidden');
    sunIcon.classList.add('hidden');
} else {
    document.documentElement.classList.remove('dark');
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
}

// Manejar el clic en el botón de alternar tema
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
});

// Configurar el formulario de logout para enviar el token CSRF
document.addEventListener('DOMContentLoaded', () => {
    const logoutForm = document.getElementById('logout-form');
    if (logoutForm) {
        const csrfToken = getCookie('csrftoken');
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = 'csrfmiddlewaretoken';
        csrfInput.value = csrfToken;
        logoutForm.appendChild(csrfInput);
    }
    // AHORA LA PESTAÑA DE TAREAS ES LA PRIMERA EN ABRIRSE
    openTab('todo-list-content'); 
    // Carga las tareas existentes al iniciar la página
    renderTasks();
});