
from rest_framework import serializers

from .models import (
    Propiedad,
    Lote,
    FotoPropiedad,
    VideoPropiedad,
)


class FotoPropiedadSerializer(serializers.ModelSerializer):
    class Meta:
        model = FotoPropiedad
        fields = [
            "id",
            "imagen",
            "descripcion",
            "orden",
        ]


class VideoPropiedadSerializer(serializers.ModelSerializer):
    archivo = serializers.FileField(
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = VideoPropiedad
        fields = [
            "id",
            "tipo",
            "titulo",
            "archivo",
            "url",
            "orden",
        ]


class LoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lote
        fields = "__all__"


class PropiedadSerializer(serializers.ModelSerializer):
    galeria_fotos = FotoPropiedadSerializer(
        many=True,
        read_only=True
    )

    videos = VideoPropiedadSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Propiedad
        fields = "__all__"
