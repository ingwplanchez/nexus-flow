import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

# Carga las variables de entorno para la clave de API
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

# Asegúrate de que la clave de API está configurada
if not API_KEY:
    raise ValueError("GEMINI_API_KEY no está configurada en el archivo .env")

# Configura la API de Google
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

def index(request):
    """Ruta principal que renderiza el archivo index.html."""
    return render(request, 'index.html')

@csrf_exempt
def analyze_eisenhower(request):
    """Endpoint para la Matriz de Eisenhower."""
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
            - Tarea sugerida: [La tarea elegida]
            - Categoría: [La categoría elegida]
            - Justificación: [Una breve explicación]
            """
            response = model.generate_content(prompt)
            return JsonResponse({"result": response.text})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Método no permitido."}, status=405)

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

@csrf_exempt
def analyze_yerkes_dodson(request):
    """Endpoint para la Ley de Yerkes-Dodson."""
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
            return JsonResponse({"result": response.text})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Método no permitido."}, status=405)
