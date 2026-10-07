from rest_framework import viewsets
from .models import Propiedad, Lote
from .serializers import PropiedadSerializer, LoteSerializer


class PropiedadViewSet(viewsets.ModelViewSet):

    queryset = Propiedad.objects.all()
    serializer_class = PropiedadSerializer


class LoteViewSet(viewsets.ModelViewSet):

    queryset = Lote.objects.all()
    serializer_class = LoteSerializer