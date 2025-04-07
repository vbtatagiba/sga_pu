from django.contrib import admin
from django.http import HttpResponse
import csv
from datetime import datetime
from .models import Servico, Atendimento

@admin.register(Servico)
class ServicoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'sigla', 'tempo_estimado')
    search_fields = ('nome', 'sigla')
    actions = ['exportar_servicos']

    def exportar_servicos(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="servicos_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['ID', 'Nome', 'Sigla', 'Tempo Estimado', 'Último Número'])
        
        for servico in queryset:
            writer.writerow([servico.id, servico.nome, servico.sigla, servico.tempo_estimado, servico.ultimo_numero])
        
        return response
    
    exportar_servicos.short_description = "Exportar serviços selecionados para CSV"

@admin.register(Atendimento)
class AtendimentoAdmin(admin.ModelAdmin):
    list_display = ('senha', 'servico', 'status', 'criado_em', 'mesa', 'tempo_atendimento')
    list_filter = ('status', 'servico', 'mesa', 'periodo')
    search_fields = ('senha', 'servico__nome')
    autocomplete_fields = ['servico']
    actions = ['exportar_atendimentos', 'excluir_atendimentos']
    readonly_fields = ('tempo_atendimento', 'periodo')
    
    def exportar_atendimentos(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="atendimentos_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['ID', 'Senha', 'Serviço', 'Status', 'Criado em', 'Chamado em', 'Finalizado em', 'Mesa', 'Período', 'Tempo de Atendimento'])
        
        for atendimento in queryset:
            writer.writerow([
                atendimento.id,
                atendimento.senha,
                atendimento.servico.nome,
                atendimento.status,
                atendimento.criado_em,
                atendimento.chamado_em,
                atendimento.finalizado_em,
                atendimento.mesa,
                atendimento.periodo,
                atendimento.tempo_atendimento
            ])
        
        return response
    
    exportar_atendimentos.short_description = "Exportar atendimentos selecionados para CSV"
    
    def excluir_atendimentos(self, request, queryset):
        count = queryset.count()
        queryset.delete()
        self.message_user(request, f"{count} atendimento(s) excluído(s) com sucesso.")
    
    excluir_atendimentos.short_description = "Excluir atendimentos selecionados"