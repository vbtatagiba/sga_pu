from django.db import models
from django.utils import timezone
from datetime import datetime, time

class Servico(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    sigla = models.CharField(max_length=3, unique=True, null=True, blank=True, help_text="Sigla do serviço (ex: BU, BA)")
    tempo_estimado = models.IntegerField(help_text="Tempo médio de atendimento em minutos")
    ultimo_numero = models.IntegerField(default=0, help_text="Último número de senha usado para este serviço")

    def __str__(self):
        return self.nome

    def gerar_proximo_numero(self):
        """Gera o próximo número sequencial para a senha"""
        self.ultimo_numero += 1
        if self.ultimo_numero > 99999:
            self.ultimo_numero = 1
        self.save()
        return str(self.ultimo_numero).zfill(5)

class Atendimento(models.Model):
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('chamado', 'Chamado'),
        ('em_atendimento', 'Em Atendimento'),
        ('finalizado', 'Finalizado'),
    ]

    PERIODO_CHOICES = [
        ('manha', 'Manhã (07h-13h)'),
        ('tarde', 'Tarde (13h-19h)'),
    ]

    senha = models.CharField(max_length=10, unique=True)
    servico = models.ForeignKey(Servico, on_delete=models.CASCADE, related_name="atendimentos")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')
    criado_em = models.DateTimeField(auto_now_add=True)
    chamado_em = models.DateTimeField(null=True, blank=True)
    inicio_em = models.DateTimeField(null=True, blank=True)
    finalizado_em = models.DateTimeField(null=True, blank=True)
    mesa = models.CharField(max_length=10, null=True, blank=True, help_text="Número da mesa do atendimento")
    periodo = models.CharField(max_length=10, choices=PERIODO_CHOICES, null=True, blank=True)
    tempo_atendimento = models.IntegerField(null=True, blank=True, help_text="Tempo de atendimento em minutos")

    def save(self, *args, **kwargs):
        # Determinar o período antes de salvar
        if self.criado_em:
            hora = self.criado_em.hour
            self.periodo = 'manha' if 7 <= hora < 13 else 'tarde'

        # Calcular tempo de atendimento quando finalizado
        if self.status == 'finalizado' and self.chamado_em and self.finalizado_em:
            self.tempo_atendimento = int((self.finalizado_em - self.chamado_em).total_seconds() / 60)

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Senha {self.senha} - {self.servico.nome}"
