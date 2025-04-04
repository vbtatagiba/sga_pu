
from django.contrib import admin
from .models import Servico, Atendimento

@admin.register(Servico)
class ServicoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'tempo_estimado')
    search_fields = ('nome',)

@admin.register(Atendimento)
class AtendimentoAdmin(admin.ModelAdmin):
    list_display = ('senha', 'servico', 'status', 'criado_em', 'mesa')
    list_filter = ('status', 'servico')
    search_fields = ('senha',)
    autocomplete_fields = ['servico']  # Permite buscar serviços facilmente