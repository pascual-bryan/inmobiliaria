from rest_framework.routers import DefaultRouter
from .views import PropiedadViewSet, LoteViewSet


router = DefaultRouter()

router.register(
    r'propiedades',
    PropiedadViewSet,
    basename='propiedad'
)

router.register(
    r'lotes',
    LoteViewSet,
    basename='lote'
)


urlpatterns = router.urls