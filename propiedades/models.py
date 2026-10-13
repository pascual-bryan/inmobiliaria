
from django.db import models


class Propiedad(models.Model):
    titulo = models.CharField(max_length=150)
    descripcion = models.TextField()
    tipo = models.CharField(max_length=50)
    operacion = models.CharField(max_length=30)
    precio = models.DecimalField(max_digits=12, decimal_places=2)
    ubicacion = models.CharField(max_length=200)
    ciudad = models.CharField(max_length=100)

    estado = models.CharField(
        max_length=100,
        default="Puebla"
    )

    recamaras = models.PositiveIntegerField(default=0)
    banos = models.PositiveIntegerField(default=0)
    estacionamientos = models.PositiveIntegerField(default=0)

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
        upload_to="propiedades/",
        blank=True,
        null=True
    )

    activa = models.BooleanField(default=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

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

    ubicacion_maps = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name="Enlace de Google Maps"
    )

    def __str__(self):
        return self.titulo


class Lote(models.Model):
    ESTADOS = [
        ("disponible", "Disponible"),
        ("apartado", "Apartado"),
        ("vendido", "Vendido"),
    ]

    propiedad = models.ForeignKey(
        Propiedad,
        related_name="lotes",
        on_delete=models.CASCADE
    )

    numero = models.PositiveIntegerField()
    superficie = models.DecimalField(
        max_digits=10,
        decimal_places=2
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

    medidas = models.CharField(
        max_length=200,
        blank=True,
        default=""
    )

    precio = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )

    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default="disponible"
    )

    informacion_precios = models.TextField(
        blank=True,
        default="",
        verbose_name="Precios y formas de pago",
        help_text=(
            "Indica precio total, enganche, mensualidad "
            "y precio de contado de este lote."
        )
    )

    def __str__(self):
        return f"Lote {self.numero} - {self.propiedad.titulo}"


class FotoPropiedad(models.Model):
    propiedad = models.ForeignKey(
        Propiedad,
        on_delete=models.CASCADE,
        related_name="galeria_fotos"
    )

    imagen = models.ImageField(
        upload_to="propiedades/galeria/"
    )

    descripcion = models.CharField(
        max_length=200,
        blank=True
    )

    orden = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["orden", "id"]
        verbose_name = "Foto de propiedad"
        verbose_name_plural = "Fotos de propiedades"

    def __str__(self):
        return f"Foto de {self.propiedad}"


class VideoPropiedad(models.Model):
    propiedad = models.ForeignKey(
        Propiedad,
        on_delete=models.CASCADE,
        related_name="videos"
    )

    TIPOS_VIDEO = [
        ("archivo", "Archivo MP4"),
        ("youtube", "YouTube"),
    ]

    tipo = models.CharField(
        max_length=10,
        choices=TIPOS_VIDEO,
        default="archivo"
    )

    titulo = models.CharField(
        max_length=200,
        default="Recorrido de la propiedad"
    )

    archivo = models.FileField(
        upload_to="propiedades/videos/",
        blank=True,
        null=True
    )

    url = models.URLField(blank=True)
    orden = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["orden", "id"]
        verbose_name = "Video de propiedad"
        verbose_name_plural = "Videos de propiedades"

    def __str__(self):
        return f"{self.titulo} - {self.propiedad}"
