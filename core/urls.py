from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # Endpoints de la API, ahora protegidos
    path('api/eisenhower/', views.analyze_eisenhower, name='analyze_eisenhower'),
    path('api/laborit/', views.analyze_laborit, name='analyze_laborit'),
    path('api/yerkes-dodson/', views.analyze_yerkes_dodson, name='analyze_yerkes_dodson'),
    
    # Nuevos endpoints para el historial
    path('api/tasks/history/', views.tasks_history, name='tasks_history'),
    path('api/daily-plans/history/', views.daily_plans_history, name='daily_plans_history'),
]
