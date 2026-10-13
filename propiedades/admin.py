
from django.contrib import admin
from .models import (
    Propiedad,
    Lote,
    FotoPropiedad,
    VideoPropiedad,
)


# ==========================================
# FOTOS DENTRO DE CADA PROPIEDAD
# ==========================================

class FotoPropiedadInline(admin.TabularInline):
    model = FotoPropiedad
    extra = 1
    fields = ("imagen", "descripcion", "orden")
    ordering = ("orden",)


# ==========================================
# VIDEOS DENTRO DE CADA PROPIEDAD
# ==========================================

class VideoPropiedadInline(admin.StackedInline):
    model = VideoPropiedad
    extra = 0
    fields = ("titulo", "tipo", "archivo", "url", "orden")
    ordering = ("orden",)


# ==========================================
# ADMINISTRACIÓN DE PROPIEDADES
# ==========================================

@admin.register(Propiedad)
class PropiedadAdmin(admin.ModelAdmin):

    list_display = (
        "titulo",
        "tipo",
        "operacion",
        "precio",
        "ciudad",
        "activa",
    )

    list_filter = (
        "tipo",
        "operacion",
        "ciudad",
        "activa",
    )

    search_fields = (
        "titulo",
        "descripcion",
        "ciudad",
    )

    inlines = [
        FotoPropiedadInline,
        VideoPropiedadInline,
    ]


# ==========================================
# ADMINISTRACIÓN DE LOTES
# ==========================================

@admin.register(Lote)
class LoteAdmin(admin.ModelAdmin):

    list_display = (
        "numero",
        "propiedad",
        "superficie",
        "precio",
        "estado",
    )

    list_filter = (
        "estado",
        "propiedad",
    )

    search_fields = (
        "numero",
        "propiedad__titulo",
    )
