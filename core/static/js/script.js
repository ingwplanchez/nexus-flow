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
        showStatusMessage('Por favor, ingresa al menos una tarea para analizar.', false);
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

// Variable para almacenar el elemento que se está arrastrando
let draggedItem = null;

// Renderiza las tareas en el DOM con soporte para arrastrar y soltar
// Agrega una nueva variable global para el filtro actual
let currentFilter = 'all'; // Puede ser 'all', 'completed' o 'active'

// Actualiza la función renderTasks para incluir el campo de entrada de fecha
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

    filteredTasks.forEach((task) => {
        // Aseguramos un identificador único para cada tarea
        const originalIndex = tasks.findIndex(t => t.text === task.text && t.completed === task.completed && t.dueDate === task.dueDate);
        
        const li = document.createElement('li');
        li.className = `p-4 rounded-lg shadow flex items-center justify-between ${task.completed ? 'bg-gray-400 dark:bg-gray-600' : 'bg-secondary'} transition-colors duration-300`;
        li.classList.add('todo-item');
        if (task.completed) {
            li.classList.add('completed');
        }

        li.draggable = true;
        li.dataset.index = originalIndex;

        const dueDateText = task.dueDate ? `<span class="text-sm text-gray-500 dark:text-gray-400 ml-4 due-date-text">Fecha límite: ${task.dueDate}</span>` : '';

        li.innerHTML = `
            <div class="flex items-center flex-grow">
                <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${originalIndex})" class="h-5 w-5 rounded text-teal-600 border-gray-300 focus:ring-teal-500">
                <span id="task-text-${originalIndex}" class="ml-4 text-primary task-text flex-grow">${task.text}</span>
                <input id="task-input-${originalIndex}" type="text" value="${task.text}" class="hidden flex-grow p-2 ml-4 rounded-lg border border-teal-500 bg-container text-primary focus:outline-none">
                ${dueDateText}
                <input type="date" value="${task.dueDate || ''}" class="p-2 ml-4 rounded-lg border border-teal-500 bg-container text-primary hidden due-date-picker">
            </div>
            <div class="flex items-center space-x-2 ml-2">
                <!-- Botón de edición/guardado -->
                <button id="edit-btn-${originalIndex}" onclick="toggleEditMode(${originalIndex})" class="text-gray-500 hover:text-teal-500 transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232a2.5 2.5 0 013.536 3.536L6.5 21.036H3v-3.536l12.232-12.232zM15.232 5.232L18.768 8.768" />
                    </svg>
                </button>
                <!-- Botón de eliminación -->
                <button onclick="deleteTask(${originalIndex})" class="text-red-500 hover:text-red-700 transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        `;
        todoList.appendChild(li);
    });

    addDragAndDropListeners();
}


// Nueva función para cambiar el filtro
function setFilter(filter) {
    currentFilter = filter;
    renderTasks();
    //showStatusMessage(`Mostrando tareas: ${filter}`, true);
}


/**
 * Añade los manejadores de eventos para arrastrar y soltar a todos los elementos de la lista.
 * Esta función ahora solo se llama una vez al inicio.
 */
function addDragAndDropListeners() {
    const listItems = document.querySelectorAll('.todo-item');
    listItems.forEach(item => {
        // Evento que se dispara cuando se comienza a arrastrar un elemento
        item.addEventListener('dragstart', () => {
            draggedItem = item;
            // Añade una pequeña demora para que la clase 'dragging' se aplique correctamente
            setTimeout(() => {
                item.classList.add('dragging');
            }, 0);
        });

        // Evento que se dispara cuando se suelta el arrastre
        item.addEventListener('dragend', () => {
            if (draggedItem) {
                draggedItem.classList.remove('dragging');
                draggedItem = null;
            }
        });
    });

    // Maneja el arrastre sobre la lista para reordenar los elementos
    const todoList = document.getElementById('todo-list');
    todoList.addEventListener('dragover', (e) => {
        e.preventDefault(); // Permite que se dispare el evento 'drop'
        const afterElement = getDragAfterElement(todoList, e.clientY);
        const draggingElement = document.querySelector('.dragging');
        if (draggingElement == null) return; // Salir si no hay un elemento arrastrado válido

        if (afterElement == null) {
            // Si el elemento arrastrado está al final de la lista
            todoList.appendChild(draggingElement);
        } else {
            // Inserta el elemento arrastrado antes del elemento de referencia
            todoList.insertBefore(draggingElement, afterElement);
        }
    });

    // Maneja el evento de soltar para actualizar el orden en localStorage
    todoList.addEventListener('drop', () => {
        const draggingElement = document.querySelector('.dragging');
        if (!draggingElement) return;

        const tasks = getTasks();
        const newOrder = Array.from(todoList.children).map(li => {
            const index = parseInt(li.dataset.index);
            return tasks[index];
        });
        
        saveTasks(newOrder);
        updateTaskIndexes(); // Actualiza los índices de los elementos del DOM
        //showStatusMessage('Tareas reordenadas con éxito.', true);
    });
}

/**
 * Función auxiliar para determinar dónde colocar el elemento arrastrado.
 * @param {HTMLElement} container El contenedor de la lista de tareas.
 * @param {number} y La coordenada Y del cursor.
 * @returns {HTMLElement|null} El elemento después del cual se debe colocar el elemento arrastrado.
 */
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

/**
 * Actualiza los índices de los atributos de datos de los elementos de la lista.
 * Esto es crucial para que las funciones de eliminación y edición sigan funcionando
 * después de una reorganización.
 */
function updateTaskIndexes() {
    const listItems = document.querySelectorAll('.todo-item');
    listItems.forEach((item, newIndex) => {
        // Actualizamos el atributo de datos
        item.dataset.index = newIndex;
        
        // También actualizamos los onclocks de los botones y el checkbox
        const checkbox = item.querySelector('input[type="checkbox"]');
        const editBtn = item.querySelector('button[onclick^="toggleEditMode"]');
        const deleteBtn = item.querySelector('button[onclick^="deleteTask"]');
        
        if (checkbox) checkbox.setAttribute('onchange', `toggleTask(${newIndex})`);
        if (editBtn) editBtn.setAttribute('onclick', `toggleEditMode(${newIndex})`);
        if (deleteBtn) deleteBtn.setAttribute('onclick', `deleteTask(${newIndex})`);
    });
}


// Actualiza la función addTask para incluir la fecha límite
function addTask() {
    const newTaskInput = document.getElementById('new-task-input');
    const newDueDateInput = document.getElementById('due-date-input');
    const taskText = newTaskInput.value.trim();
    const dueDate = newDueDateInput.value;

    if (taskText) {
        // Obtenemos las tareas existentes, o un array vacío si no hay ninguna
        const tasks = getTasks();
        tasks.push({
            text: taskText,
            completed: false,
            dueDate: dueDate || null // Si no se selecciona una fecha, se guarda como null
        });
        saveTasks(tasks);
        newTaskInput.value = '';
        newDueDateInput.value = ''; // Limpiamos también el campo de fecha
        renderTasks();
        //showStatusMessage('Tarea agregada con éxito.', true);
    } else {
        showStatusMessage('Por favor, ingresa una tarea.', false);
    }
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
    //showStatusMessage('Tarea eliminada con éxito.', true);
}

// Función para alternar entre el modo de visualización y edición

// Actualiza la función toggleEditMode para manejar la edición de la fecha
function toggleEditMode(index) {
    const li = document.getElementById('todo-list').children[index];
    const taskTextSpan = li.querySelector('.task-text');
    const taskTextInput = li.querySelector('input[type="text"]');
    const dueDateSpan = li.querySelector('.due-date-text');
    const dueDatePicker = li.querySelector('.due-date-picker');
    const editBtn = li.querySelector(`#edit-btn-${index}`);

    const isEditing = li.classList.toggle('editing');

    if (isEditing) {
        // Modo de edición: ocultar el texto y mostrar los campos de entrada
        taskTextSpan.classList.add('hidden');
        taskTextInput.classList.remove('hidden');
        
        // El campo de fecha siempre existe, solo lo mostramos
        if (dueDateSpan) {
            dueDateSpan.classList.add('hidden');
        }
        dueDatePicker.classList.remove('hidden');

        taskTextInput.focus();
        editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>`;
    } else {
        // Modo de visualización: guardar los cambios y ocultar los campos de entrada
        const tasks = getTasks();
        const newText = taskTextInput.value.trim();
        const newDueDate = dueDatePicker.value;

        if (newText !== "") {
            tasks[index].text = newText;
            tasks[index].dueDate = newDueDate || null; // Guarda la nueva fecha o null si el campo está vacío
            saveTasks(tasks);
            renderTasks();
            showNotification('Tarea editada con éxito.', 'success');
        } else {
            showNotification('La tarea no puede estar vacía.', 'error');
            // Si la tarea está vacía, volvemos al modo de edición
            li.classList.add('editing');
            taskTextSpan.classList.remove('hidden');
            taskTextInput.classList.add('hidden');
            
            if (dueDateSpan) {
                dueDateSpan.classList.remove('hidden');
            }
            dueDatePicker.classList.add('hidden');
        }
        editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232a2.5 2.5 0 013.536 3.536L6.5 21.036H3v-3.536l12.232-12.232zM15.232 5.232L18.768 8.768" /></svg>`;
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
    //('Se ha limpiado la lista de tareas.', true);
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
