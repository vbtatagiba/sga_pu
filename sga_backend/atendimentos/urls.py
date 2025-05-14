from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'servicos', views.ServicoViewSet)
router.register(r'atendimentos', views.AtendimentoViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('api/atendimentos/gerar_senha/', views.AtendimentoViewSet.as_view({'post': 'gerar_senha'}), name='gerar_senha'),
    path('api/atendimentos/chamar_proximo/', views.AtendimentoViewSet.as_view({'post': 'chamar_proximo'}), name='chamar_proximo'),
    path('api/atendimentos/ultimas_chamadas/', views.AtendimentoViewSet.as_view({'get': 'ultimas_chamadas'}), name='ultimas_chamadas'),
    path('api/atendimentos/painel_chamadas/', views.AtendimentoViewSet.as_view({'get': 'painel_chamadas'}), name='painel_chamadas'),
    path('api/atendimentos/analise_desempenho/', views.analise_desempenho, name='analise_desempenho'),
    path('api/atendimentos/limpar_dados/', views.limpar_dados, name='limpar_dados'),
    path('api/atendimentos/exportar_dados/', views.exportar_dados, name='exportar_dados'),
] 