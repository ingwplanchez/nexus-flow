from django.db import models
from django.contrib.auth.models import User

# Modelo para representar una tarea o item de la Matriz de Eisenhower
class Task(models.Model):
    # Relación con el modelo de usuario de Django. Si el usuario es eliminado,
    # todas sus tareas también lo serán.
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Campo para guardar la descripción de la tarea
    description = models.CharField(max_length=255)
    
    # Campo para la categoría de la Matriz de Eisenhower
    eisenhower_category = models.CharField(max_length=50)

    # La fecha en que se creó la tarea
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s Task: {self.description}"

# Modelo para representar un plan de trabajo diario para la Ley de Yerkes-Dodson
class DailyPlan(models.Model):
    # Relación con el modelo de usuario de Django
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Campo para guardar el texto del plan diario
    plan_text = models.TextField()
    
    # La fecha en que se creó el plan
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s Daily Plan ({self.created_at.date()})"
