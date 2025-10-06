import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.decorators import login_required

from .models import Task, DailyPlan # Importamos los modelos

# Carga las variables de entorno para la clave de API
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

# Asegúrate de que la clave de API está configurada
if not API_KEY:
    raise ValueError("GEMINI_API_KEY no está configurada en el archivo .env")

# Configura la API de Google
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

@login_required
def index(request):
    """
    Ruta principal que renderiza el archivo index.html.
    Ahora solo es accesible para usuarios logueados.
    """
    return render(request, 'index.html')

def signup_view(request):
    """Vista para el registro de nuevos usuarios."""
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('index')  # Redirige a la página principal después del registro
    else:
        form = UserCreationForm()
    return render(request, 'auth/signup.html', {'form': form})

def login_view(request):
    """Vista para el inicio de sesión de usuarios."""
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('index') # Redirige a la página principal
    else:
        form = AuthenticationForm()
    return render(request, 'auth/login.html', {'form': form})

def logout_view(request):
    """Vista para cerrar la sesión del usuario."""
    if request.method == 'POST':
        logout(request)
        return redirect('login') # Redirige a la página de inicio de sesión

@login_required
@csrf_exempt
def analyze_eisenhower(request):
    """Endpoint para la Matriz de Eisenhower. Ahora guarda la tarea."""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            task_description = data.get('task')
            
            if not task_description:
                return JsonResponse({"error": "La descripción de la tarea es obligatoria."}, status=400)
            
            prompt = f"""
            Eres un experto en productividad que aplica la Matriz de Eisenhower.
            Analiza la siguiente tarea y clasifícala en una de estas cuatro categorías:
            1. Urgente e Importante
            2. Urgente y No Importante
            3. No Urgente e Importante
            4. No Urgente y No Importante

            Tarea: "{task_description}"

            Da tu respuesta en el siguiente formato, sin explicaciones adicionales:
            - Tarea: [La tarea elegida]
            - Categoría: [La categoría elegida]
            - Justificación: [Una breve explicación]
            """
            response = model.generate_content(prompt)
            result_text = response.text

            # Extraemos la categoría del resultado de la IA
            category_line = next((line for line in result_text.splitlines() if line.startswith('- Categoría:')), None)
            category = category_line.split(':')[1].strip() if category_line else "No especificada"

            # Creamos y guardamos la tarea en la base de datos
            Task.objects.create(
                user=request.user,
                description=task_description,
                eisenhower_category=category
            )
            
            return JsonResponse({"result": result_text})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Método no permitido."}, status=405)

@login_required
@csrf_exempt
def analyze_laborit(request):
    """Endpoint para la Ley de Laborit."""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            tasks_list = data.get('tasks')
            
            if not tasks_list:
                return JsonResponse({"error": "La lista de tareas es obligatoria."}, status=400)
                
            prompt = f"""
            Eres un coach de productividad que aplica la Ley de Laborit (hacer lo más difícil primero) y la Ley de Pareto (80/20).
            Analiza la siguiente lista de tareas, incluyendo su tiempo estimado, y determina cuál es la "tarea más difícil" o de mayor impacto.
            Sugiere cuál debería ser la primera tarea del día para maximizar la productividad.
            Justifica tu respuesta basándote en la Ley de Laborit.

            Lista de tareas:
            {tasks_list}

            Da tu respuesta en el siguiente formato, sin explicaciones adicionales:
            - Tarea sugerida: [La tarea elegida]
            - Justificación (Ley de Laborit y Pareto): [Una breve explicación]
            """
            response = model.generate_content(prompt)
            return JsonResponse({"result": response.text})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Método no permitido."}, status=405)

@login_required
@csrf_exempt
def analyze_yerkes_dodson(request):
    """Endpoint para la Ley de Yerkes-Dodson. Ahora guarda el plan."""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            daily_plan = data.get('plan')
            
            if not daily_plan:
                return JsonResponse({"error": "El plan diario es obligatorio."}, status=400)
                
            prompt = f"""
            Eres un experto en el manejo de la energía y el rendimiento, basándote en la Ley de Yerkes-Dodson y la Ley de Illich.
            Analiza el siguiente plan de trabajo diario e identifica si es óptimo o si podría llevar al agotamiento.
            Sugiere un ajuste para el plan, justificándolo con ambas leyes.

            Plan de trabajo:
            {daily_plan}

            Da tu respuesta en el siguiente formato, sin explicaciones adicionales:
            - Análisis: [Una evaluación del plan]
            - Justificación (Yerkes-Dodson e Illich: [Una breve explicación]
            - Sugerencia (Yerkes-Dodson e Illich): [El plan ajustado con la lista de tareas]
            """
            response = model.generate_content(prompt)
            result_text = response.text

            # Guardamos el plan en la base de datos
            DailyPlan.objects.create(
                user=request.user,
                plan_text=daily_plan
            )
            
            return JsonResponse({"result": result_text})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Método no permitido."}, status=405)

@login_required
def tasks_history(request):
    """Endpoint para obtener el historial de tareas del usuario logueado."""
    tasks = list(Task.objects.filter(user=request.user).order_by('-created_at').values('description', 'eisenhower_category', 'created_at'))
    return JsonResponse({'tasks': tasks})

@login_required
def daily_plans_history(request):
    """Endpoint para obtener el historial de planes diarios del usuario logueado."""
    daily_plans = list(DailyPlan.objects.filter(user=request.user).order_by('-created_at').values('plan_text', 'created_at'))
    return JsonResponse({'daily_plans': daily_plans})
