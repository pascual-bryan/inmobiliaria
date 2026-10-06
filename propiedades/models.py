from django.db import models


class Propiedad(models.Model):

    titulo = models.CharField(max_length=150)

    descripcion = models.TextField()

    tipo = models.CharField(max_length=50)

    operacion = models.CharField(max_length=30)

    precio = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    ubicacion = models.CharField(max_length=200)

    ciudad = models.CharField(max_length=100)

    estado = models.CharField(
        max_length=100,
        default="Puebla"
    )

    recamaras = models.PositiveIntegerField(
        default=0
    )

    banos = models.PositiveIntegerField(
        default=0
    )

    estacionamientos = models.PositiveIntegerField(
        default=0
    )

    metros_terreno = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    metros_construccion = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    imagen_principal = models.ImageField(
        upload_to='propiedades/',
        blank=True,
        null=True
    )

    activa = models.BooleanField(
        default=True
    )

    fecha_registro = models.DateTimeField(
        auto_now_add=True
    )


    frente = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    fondo = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    servicios = models.CharField(
        max_length=300,
        blank=True,
        default=""
    )


    def __str__(self):
        return self.titulo