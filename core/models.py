from django.db import models
from django.contrib.auth.models import User

class Task(models.Model):
    """
    Modelo para guardar una tarea y su categoría de Eisenhower.
    Se relaciona con el modelo de usuario por una llave foránea.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.TextField()
    eisenhower_category = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.username} - {self.description[:30]}'

class DailyPlan(models.Model):
    """
    Modelo para guardar un plan diario.
    Se relaciona con el modelo de usuario por una llave foránea.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    plan_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Plan de {self.user.username} - {self.created_at.strftime("%Y-%m-%d")}'


