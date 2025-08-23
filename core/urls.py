from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    # Rutas de autenticación
    path('login/', auth_views.LoginView.as_view(template_name='login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'),
    path('signup/', views.signup, name='signup'),
    
    # Rutas del frontend y el panel de control
    path('', views.index, name='index'),

    # Rutas de la API para los módulos de productividad
    path('api/eisenhower/', views.analyze_eisenhower, name='api-eisenhower'),
    path('api/laborit/', views.analyze_laborit, name='api-laborit'),
    path('api/yerkes-dodson/', views.analyze_yerkes_dodson, name='api-yerkes-dodson'),
    
    # Rutas de la API para el historial
    path('api/tasks/', views.tasks_view, name='api-tasks'),
    path('api/daily-plans/', views.daily_plans_view, name='api-daily-plans'),
]
