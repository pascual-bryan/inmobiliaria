from django.contrib import admin
from .models import Cita


@admin.register(Cita)
class CitaAdmin(admin.ModelAdmin):

    list_display = (
        'nombre_cliente',
        'propiedad',
        'lote',
        'fecha',
        'hora',
        'estado',
    )

    list_filter = (
        'estado',
        'fecha',
        'propiedad',
    )

    search_fields = (
        'nombre_cliente',
        'telefono',
        'correo',
    )

    ordering = (
        'fecha',
        'hora',
    )