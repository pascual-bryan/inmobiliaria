from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAdminUser

from .models import Propiedad, Lote
from .serializers import PropiedadSerializer, LoteSerializer


class PropiedadViewSet(viewsets.ModelViewSet):
    queryset = Propiedad.objects.all()
    serializer_class = PropiedadSerializer

    def get_permissions(self):
        # Cualquier visitante puede consultar propiedades.
        # Solo un administrador puede crear, editar o eliminar.
        if self.action in ["list", "retrieve"]:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]

        return [permission() for permission in permission_classes]


class LoteViewSet(viewsets.ModelViewSet):
    queryset = Lote.objects.all()
    serializer_class = LoteSerializer

    def get_permissions(self):
        # Los visitantes pueden consultar los lotes disponibles.
        # Solo un administrador puede modificarlos.
        if self.action in ["list", "retrieve"]:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]

        return [permission() for permission in permission_classes]
