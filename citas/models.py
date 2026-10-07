from django.db import models
from propiedades.models import Propiedad, Lote


class Cita(models.Model):

    ESTADOS = [
        ("pendiente", "Pendiente"),
        ("confirmada", "Confirmada"),
        ("realizada", "Realizada"),
        ("cancelada", "Cancelada"),
    ]

    propiedad = models.ForeignKey(
        Propiedad,
        on_delete=models.CASCADE,
        related_name="citas"
    )

    lote = models.ForeignKey(
        Lote,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="citas"
    )

    nombre_cliente = models.CharField(
        max_length=150
    )

    telefono = models.CharField(
        max_length=30
    )

    correo = models.EmailField(
        blank=True,
        default=""
    )

    fecha = models.DateField()

    hora = models.TimeField()

    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default="pendiente"
    )

    comentario = models.TextField(
        blank=True,
        default=""
    )

    fecha_registro = models.DateTimeField(
        auto_now_add=True
    )
    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["fecha", "hora"],
                name="cita_fecha_hora_unica"
            )
        ]

    def __str__(self):
        return f"{self.nombre_cliente} - {self.fecha} {self.hora}"