from django.core.management.base import BaseCommand
from atendimentos.models import Servico, Atendimento
from django.db import transaction

class Command(BaseCommand):
    help = 'Atualiza as siglas dos serviços e limpa dados antigos'

    def handle(self, *args, **options):
        # Limpar dados antigos
        with transaction.atomic():
            Atendimento.objects.all().delete()
            Servico.objects.all().delete()

            # Definir serviços corretos
            servicos = [
                {'nome': 'Bilhete Universitário', 'sigla': 'BU'},
                {'nome': 'Requerimentos', 'sigla': 'RQ'},
                {'nome': 'Contrapartida', 'sigla': 'CP'},
                {'nome': 'Bolsa Auxílio', 'sigla': 'BA'},
            ]

            # Criar novos serviços
            for servico in servicos:
                Servico.objects.create(
                    nome=servico['nome'],
                    sigla=servico['sigla'],
                    tempo_estimado=15,
                    ultimo_numero=0  # Inicializa o contador de senhas
                )
                self.stdout.write(
                    self.style.SUCCESS(f'Criado serviço "{servico["nome"]}" com sigla "{servico["sigla"]}"')
                ) 