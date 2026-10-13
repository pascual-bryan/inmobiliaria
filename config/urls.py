
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth.decorators import user_passes_test
from django.http import JsonResponse
from django.middleware.csrf import get_token

def csrf_token_view(request):
    return JsonResponse({
        "csrfToken": get_token(request)
    })



urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/csrf/', csrf_token_view, name='csrf_token'),
    path('api/', include('propiedades.urls')),
    path('api/', include('citas.urls')),

    path(
        'propiedades/',
        TemplateView.as_view(
            template_name='propiedades.html'
        ),
        name='propiedades'
    ),
    path(
        'propiedades.html',
        TemplateView.as_view(template_name='propiedades.html'),
        name='propiedades_html'
        ),
    path(
        'index.html',
        TemplateView.as_view(template_name='index.html'),
        name='index'
        ),
    path(
        'nosotros.html',
        TemplateView.as_view(template_name='nosotros.html'),
        name='nosotros'
        ),
    path(
        'contacto.html',
        TemplateView.as_view(template_name='contacto.html'),
        name='contacto'
        ),
    path(
        'propiedad.html',
        TemplateView.as_view(template_name='propiedad.html'),
        name='propiedad'
        ),
    path(
        'dashboard.html',
        user_passes_test(
        lambda user: user.is_authenticated and user.is_staff,
        login_url='/login/'
        )(
        TemplateView.as_view(template_name='dashboard.html')
        ),
        name='dashboard'
    ),
    path(
        'login/',
        LoginView.as_view(template_name='login.html'),
        name='login'
    ),

    path(
        'logout/',
        LogoutView.as_view(),
        name='logout'
    ),

]

urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT
)


