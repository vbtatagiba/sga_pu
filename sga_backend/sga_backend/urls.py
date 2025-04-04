from django.urls import path, include
from rest_framework.routers import DefaultRouter
from atendimentos.views import ServicoViewSet, AtendimentoViewSet
from django.contrib import admin

router = DefaultRouter()
router.register(r'servicos', ServicoViewSet)
router.register(r'atendimentos', AtendimentoViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/atendimentos/gerar_senha/', AtendimentoViewSet.as_view({'post': 'gerar_senha'}), name='gerar_senha'),
    path('api/atendimentos/chamar_proximo/', AtendimentoViewSet.as_view({'post': 'chamar_proximo'}), name='chamar_proximo'),
    path('api/atendimentos/ultimas_chamadas/', AtendimentoViewSet.as_view({'get': 'ultimas_chamadas'}), name='ultimas_chamadas'),
    path('api/atendimentos/painel_chamadas/', AtendimentoViewSet.as_view({'get': 'painel_chamadas'}), name='painel_chamadas'),
]
