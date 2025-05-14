from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db import IntegrityError

class Command(BaseCommand):
    help = 'Cria um superuser padrão para o sistema'

    def handle(self, *args, **options):
        username = 'SGAadmin'
        password = 'passaporte2025'
        email = 'vbtatagiba77@gmail.com'

        try:
            # Verifica se o usuário já existe
            if not User.objects.filter(username=username).exists():
                User.objects.create_superuser(username, email, password)
                self.stdout.write(self.style.SUCCESS(f'Superuser "{username}" criado com sucesso!'))
            else:
                self.stdout.write(self.style.SUCCESS(f'Superuser "{username}" já existe.'))
        except IntegrityError as e:
          self.stdout.write(self.style.ERROR(f'Erro ao criar superuser "{username}": {e}'))