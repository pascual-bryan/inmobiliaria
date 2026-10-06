from django.contrib import admin
from .models import Propiedad


@admin.register(Propiedad)
class PropiedadAdmin(admin.ModelAdmin):

    list_display = (
        'titulo',
        'tipo',
        'operacion',
        'precio',
        'ciudad',
        'activa',
    )

    list_filter = (
        'tipo',
        'operacion',
        'ciudad',
        'activa',
    )

    search_fields = (
        'titulo',
        'descripcion',
        'ciudad',
    )