from django.contrib import admin
from .models import Propiedad, Lote


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

@admin.register(Lote)
class LoteAdmin(admin.ModelAdmin):

    list_display = (
        'numero',
        'propiedad',
        'superficie',
        'precio',
        'estado',
    )

    list_filter = (
        'estado',
        'propiedad',
    )

    search_fields = (
        'numero',
        'propiedad__titulo',
    )