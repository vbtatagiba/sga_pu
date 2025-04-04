
from django.db import models

class Servico(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    tempo_estimado = models.IntegerField(help_text="Tempo médio de atendimento em minutos")

    def __str__(self):
        return self.nome


class Atendimento(models.Model):
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('chamado', 'Chamado'),
        ('finalizado', 'Finalizado'),
    ]

    senha = models.CharField(max_length=10, unique=True)
    servico = models.ForeignKey(Servico, on_delete=models.CASCADE, related_name="atendimentos")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')
    criado_em = models.DateTimeField(auto_now_add=True)
    chamado_em = models.DateTimeField(null=True, blank=True)
    finalizado_em = models.DateTimeField(null=True, blank=True)
    mesa = models.CharField(max_length=10, null=True, blank=True, help_text="Número da mesa do atendimento")

    def __str__(self):
        return f"Senha {self.senha} - {self.servico.nome}"
