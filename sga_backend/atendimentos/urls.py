from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'servicos', views.ServicoViewSet)
router.register(r'atendimentos', views.AtendimentoViewSet)

urlpatterns = [
    # URLs específicas baseadas em funções devem vir primeiro
    path('atendimentos/analise_desempenho/', views.analise_desempenho, name='analise_desempenho'),
    path('atendimentos/limpar_dados/', views.limpar_dados, name='limpar_dados'),
    path('atendimentos/exportar_dados/', views.exportar_dados, name='exportar_dados'),

    # URLs geradas pelo router vêm depois
    path('', include(router.urls)),
] 