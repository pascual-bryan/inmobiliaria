from rest_framework import serializers
from .models import Cita


class CitaSerializer(serializers.ModelSerializer):

    class Meta:
        model = Cita
        fields = '__all__'

    def validate(self, data):

        fecha = data.get("fecha")
        hora = data.get("hora")

        cita_existente = Cita.objects.filter(
            fecha=fecha,
            hora=hora
        )

        if self.instance:
            cita_existente = cita_existente.exclude(
                id=self.instance.id
            )

        if cita_existente.exists():

            raise serializers.ValidationError({
                "hora": "Este horario ya está ocupado."
            })

        return data

