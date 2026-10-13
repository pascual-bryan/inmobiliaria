from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAdminUser

from .models import Cita
from .serializers import CitaSerializer


class CitaViewSet(viewsets.ModelViewSet):

    queryset = Cita.objects.all().order_by(
        "fecha",
        "hora"
    )

    serializer_class = CitaSerializer

    def get_permissions(self):
        # Los visitantes solo pueden solicitar una cita.
        if self.action == "create":
            permission_classes = [AllowAny]

        # Solo el personal administrativo puede consultar,
        # modificar o eliminar las citas registradas.
        else:
            permission_classes = [IsAdminUser]

        return [permission() for permission in permission_classes]
