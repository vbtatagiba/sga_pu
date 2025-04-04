from django.core.management.base import BaseCommand
from atendimentos.models import Servico

class Command(BaseCommand):
    help = 'Cria os serviços padrão no sistema'

    def handle(self, *args, **kwargs):
        servicos_padrao = [
            "Bilhete universitário",
            "Requerimentos",
            "Contra partida",
            "Bolsa auxílio",
        ]
        
        for servico in servicos_padrao:
            Servico.objects.get_or_create(nome=servico, tempo_estimado=30)
            self.stdout.write(self.style.SUCCESS(f'Serviço "{servico}" criado com sucesso')) 