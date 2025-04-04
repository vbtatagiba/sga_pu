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

class AtendimentoViewSet(viewsets.ModelViewSet):
    queryset = Atendimento.objects.all().order_by('-criado_em')
    serializer_class = AtendimentoSerializer

    @action(detail=False, methods=['post'])
    def gerar_senha(self, request):
        servico_id = request.data.get('servico_id')
        mesa = request.data.get('mesa', 1)
        
        try:
            servico = Servico.objects.get(id=servico_id)
            
            # Gera uma senha usando timestamp para garantir unicidade
            timestamp = datetime.now().strftime('%H%M%S')
            nova_senha = f"{servico.sigla}{timestamp}"
            
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