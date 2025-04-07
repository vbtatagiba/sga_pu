from rest_framework import serializers
from .models import Servico, Atendimento

class ServicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servico
        fields = ['id', 'nome', 'sigla', 'tempo_estimado', 'ultimo_numero']

class AtendimentoSerializer(serializers.ModelSerializer):
    servico_nome = serializers.ReadOnlyField(source='servico.nome')

    class Meta:
        model = Atendimento
        fields = ['id', 'senha', 'servico', 'servico_nome', 'status', 'criado_em', 'chamado_em', 'finalizado_em', 'mesa']
