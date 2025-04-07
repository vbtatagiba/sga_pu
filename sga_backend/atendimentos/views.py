from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from django.utils.timezone import now
from .models import Servico, Atendimento
from .serializers import ServicoSerializer, AtendimentoSerializer
import random
from rest_framework import status
from datetime import datetime
from django.contrib.admin.views.decorators import staff_member_required
from django.utils import timezone
from django.db.models import Avg, Count
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from datetime import timedelta
import json

class AtendimentoViewSet(viewsets.ModelViewSet):
    queryset = Atendimento.objects.all().order_by('-criado_em')
    serializer_class = AtendimentoSerializer

    @action(detail=False, methods=['post'])
    def gerar_senha(self, request):
        servico_id = request.data.get('servico_id')
        mesa = request.data.get('mesa', 1)
        
        try:
            servico = Servico.objects.get(id=servico_id)
            
            # Gera uma senha usando número sequencial
            numero = servico.gerar_proximo_numero()
            nova_senha = f"{servico.sigla}{numero}"
            
            atendimento = Atendimento.objects.create(
                senha=nova_senha,
                servico=servico,
                mesa=mesa
            )
            
            return Response({
                'senha': atendimento.senha,
                'servico': atendimento.servico.nome,
                'mesa': atendimento.mesa
            })
            
        except Servico.DoesNotExist:
            return Response(
                {'error': 'Serviço não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def chamar_proximo(self, request):
        """Chama a próxima senha na fila e finaliza a anterior automaticamente"""
        atendimento_anterior = Atendimento.objects.filter(status='chamado').order_by('-chamado_em').first()
        
        if atendimento_anterior:
            atendimento_anterior.status = 'finalizado'
            atendimento_anterior.finalizado_em = now()
            atendimento_anterior.save()

        atendimento = Atendimento.objects.filter(status='pendente').order_by('criado_em').first()
        
        if not atendimento:
            return Response({"message": "Nenhuma senha na fila."}, status=400)
        
        # Atribuir mesa com base no serviço
        if atendimento.servico.nome == "Bolsa Auxílio":
            atendimento.mesa = 3
        else:
            # Atribui mesa 1 ou 2 com base na disponibilidade
            if Atendimento.objects.filter(mesa=1, status='chamado').count() == 0:
                atendimento.mesa = 1
            else:
                atendimento.mesa = 2
        
        atendimento.status = 'chamado'
        atendimento.chamado_em = now()
        atendimento.save()

        return Response(AtendimentoSerializer(atendimento).data)
    
    @action(detail=False, methods=['get'])
    def ultimas_chamadas(self, request):
        """Retorna as últimas senhas chamadas."""
        atendimentos_chamados = Atendimento.objects.filter(status='chamado').order_by('-chamado_em')[:10]  # Limita às 10 últimas chamadas
        return Response(AtendimentoSerializer(atendimentos_chamados, many=True).data)
    
    @action(detail=False, methods=['get'])
    def painel_chamadas(self, request):
        """Retorna as senhas atualmente chamadas por mesa."""
        # Busca as senhas chamadas por mesa
        mesa1 = Atendimento.objects.filter(mesa=1, status='chamado').first()
        mesa2 = Atendimento.objects.filter(mesa=2, status='chamado').first()
        mesa3 = Atendimento.objects.filter(mesa=3, status='chamado').first()
        
        # Busca as últimas 10 senhas finalizadas para o histórico
        historico = Atendimento.objects.filter(status='finalizado').order_by('-finalizado_em')[:10]
        
        return Response({
            'mesa1': AtendimentoSerializer(mesa1).data if mesa1 else None,
            'mesa2': AtendimentoSerializer(mesa2).data if mesa2 else None,
            'mesa3': AtendimentoSerializer(mesa3).data if mesa3 else None,
            'historico': AtendimentoSerializer(historico, many=True).data
        })

class ServicoViewSet(viewsets.ModelViewSet):
    queryset = Servico.objects.all()
    serializer_class = ServicoSerializer

@staff_member_required
def dashboard(request):
    return render(request, 'admin/dashboard.html')

@staff_member_required
@require_http_methods(["GET"])
def analise_desempenho(request):
    periodo = request.GET.get('periodo', 'manha')
    mesa = request.GET.get('mesa', 'todas')
    
    # Definir período de tempo
    hoje = timezone.now().date()
    if periodo == 'manha':
        inicio = datetime.combine(hoje, datetime.strptime('07:00', '%H:%M').time())
        fim = datetime.combine(hoje, datetime.strptime('13:00', '%H:%M').time())
    else:  # tarde
        inicio = datetime.combine(hoje, datetime.strptime('13:00', '%H:%M').time())
        fim = datetime.combine(hoje, datetime.strptime('19:00', '%H:%M').time())
    
    # Filtrar atendimentos
    atendimentos = Atendimento.objects.filter(
        criado_em__date=hoje,
        criado_em__time__gte=inicio.time(),
        criado_em__time__lt=fim.time(),
        status='finalizado'
    )
    
    if mesa != 'todas':
        atendimentos = atendimentos.filter(mesa=mesa)
    
    # Estatísticas por mesa
    mesa_stats = []
    for mesa_num in range(1, 4):
        mesa_atendimentos = atendimentos.filter(mesa=mesa_num)
        total = mesa_atendimentos.count()
        tempo_medio = mesa_atendimentos.aggregate(Avg('tempo_atendimento'))['tempo_atendimento__avg'] or 0
        
        mesa_stats.append({
            'numero': mesa_num,
            'total': total,
            'tempo_medio': round(tempo_medio, 1)
        })
    
    # Estatísticas por serviço
    servico_stats = []
    for servico in Servico.objects.all():
        servico_atendimentos = atendimentos.filter(servico=servico)
        total = servico_atendimentos.count()
        tempo_medio = servico_atendimentos.aggregate(Avg('tempo_atendimento'))['tempo_atendimento__avg'] or 0
        
        servico_stats.append({
            'nome': servico.nome,
            'total': total,
            'tempo_medio': round(tempo_medio, 1)
        })
    
    return JsonResponse({
        'mesas': mesa_stats,
        'servicos': servico_stats
    })

@staff_member_required
@require_http_methods(["POST"])
def limpar_dados(request):
    try:
        # Limpar todos os atendimentos
        Atendimento.objects.all().delete()
        return JsonResponse({'message': 'Dados limpos com sucesso'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@staff_member_required
@require_http_methods(["GET"])
def exportar_dados(request):
    try:
        # Exportar dados dos últimos 30 dias
        data_inicio = timezone.now() - timedelta(days=30)
        atendimentos = Atendimento.objects.filter(criado_em__gte=data_inicio)
        
        dados = []
        for atendimento in atendimentos:
            dados.append({
                'senha': atendimento.senha,
                'servico': atendimento.servico.nome,
                'mesa': atendimento.mesa,
                'status': atendimento.status,
                'criado_em': atendimento.criado_em.strftime('%Y-%m-%d %H:%M:%S'),
                'chamado_em': atendimento.chamado_em.strftime('%Y-%m-%d %H:%M:%S') if atendimento.chamado_em else None,
                'finalizado_em': atendimento.finalizado_em.strftime('%Y-%m-%d %H:%M:%S') if atendimento.finalizado_em else None,
                'tempo_atendimento': atendimento.tempo_atendimento,
                'periodo': atendimento.periodo
            })
        
        return JsonResponse({'dados': dados})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)