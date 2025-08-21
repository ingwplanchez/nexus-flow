# Nexus Flow: Sistema de Gestión de Productividad Impulsado por IA

**Nexus Flow** es un proyecto de aplicación web para la productividad personal, diseñada para ayudarte a optimizar tu tiempo y energía. Su funcionalidad principal se basa en [Nexus GEM](https://github.com/ingwplanchez/nexus-gem), un prototipo de modelo de IA generativa integrado, que actúa como el "cerebro" inteligente de la plataforma.

Este sistema utiliza el poder de la inteligencia artificial para analizar tus tareas, planes diarios y hábitos de trabajo, ofreciéndote sugerencias estratégicas basadas en principios de productividad probados.

## Características Principales

* **Integración de IA (Nexus GEM):** El corazón del proyecto, donde se aplica la inteligencia artificial de Google Gemini para procesar la lógica de negocio y las recomendaciones.

* **Matriz de Eisenhower:** Analiza y clasifica tus tareas automáticamente según su urgencia e importancia.

* **Ley de Laborit y Pareto:** Evalúa tus listas de tareas para identificar la actividad de mayor impacto que debes abordar primero.

* **Ley de Yerkes-Dodson e Illich:** Examina tu plan diario para recomendar el mejor equilibrio entre esfuerzo y descanso, ayudándote a evitar el agotamiento.

* **Arquitectura Robusta:** Construido con el framework **Django**, este proyecto ofrece una base sólida y escalable, lista para futuras expansiones.

## Tecnologías Utilizadas

* **Backend:** **Python** con el framework **Django**.

* **Frontend:** **HTML5**, **CSS3** y **JavaScript**.

* **APIs:** **Google Gemini API** (para la inteligencia artificial).

* **Otras librerías:** `django-cors-headers` (para seguridad y comunicación), `python-dotenv` (para la gestión de variables de entorno).

## Cómo Iniciar el Proyecto

Sigue estos pasos para configurar y ejecutar Nexus Flow en tu entorno local.

1.  **Clona el repositorio:**
    ```
    git clone https://github.com/ingwplanchez/nexus-flow.git
    cd nexus-flow
    ```

2.  **Crea y activa un entorno virtual:**
    ```
    python -m venv venv
    source venv/bin/activate  # En Linux/macOS
    # o venv\Scripts\activate  # En Windows
    ```

3.  **Instala las dependencias necesarias:**
    ```
    pip install -r requirements.txt
    # O, si no tienes requirements.txt:
    # pip install Django Flask-Cors google-generativeai python-dotenv
    ```

4.  **Configura tu clave de API:**
    * Obtén tu clave de API de Gemini en [Google AI Studio](https://aistudio.google.com/app/apikey).
    * Crea un archivo llamado `.env` en el directorio raíz del proyecto y añade tu clave de la siguiente manera:
        ```
        GEMINI_API_KEY="TU_CLAVE_DE_API_AQUI"
        ```

5.  **Ejecuta las migraciones de la base de datos y el servidor:**
    ```
    python manage.py migrate
    python manage.py runserver
    ```

6.  **Accede a la aplicación:**
    Abre tu navegador web y navega a la siguiente URL:

    `http://127.0.0.1:8000`

