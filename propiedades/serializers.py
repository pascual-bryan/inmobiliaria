from rest_framework import serializers
from .models import Propiedad, Lote


class LoteSerializer(serializers.ModelSerializer):

    class Meta:
        model = Lote
        fields = '__all__'


class PropiedadSerializer(serializers.ModelSerializer):

    class Meta:
        model = Propiedad
        fields = '__all__'