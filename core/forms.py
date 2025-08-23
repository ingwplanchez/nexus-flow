from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm

class CustomUserCreationForm(UserCreationForm):
    """
    Formulario de registro de usuario personalizado.
    Hereda de UserCreationForm de Django, que ya maneja los campos y validaciones.
    """
    class Meta(UserCreationForm.Meta):
        # Utiliza el modelo de usuario predeterminado de Django
        model = UserCreationForm.Meta.model
        # Define los campos que el usuario debe rellenar al registrarse
        fields = ('username',)


class CustomAuthenticationForm(AuthenticationForm):
    """
    Formulario de inicio de sesión de usuario personalizado.
    Hereda de AuthenticationForm de Django, que ya gestiona la validación de credenciales.
    """
    class Meta:
        # No se necesita un modelo para este formulario, ya que solo valida credenciales
        model = None
        # Campos para el inicio de sesión
        fields = ('username', 'password')

