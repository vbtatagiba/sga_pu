# Generated by Django 5.2 on 2025-04-04 17:26

import django.db.models.deletion
from django.db import migrations, models
from django.core.management import call_command


def create_superuser(apps, schema_editor):
    call_command('criar_superuser_padrao')


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Servico',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome', models.CharField(max_length=100, unique=True)),
                ('tempo_estimado', models.IntegerField(help_text='Tempo médio de atendimento em minutos')),
            ],
        ),
        migrations.CreateModel(
            name='Atendimento',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('senha', models.CharField(max_length=10, unique=True)),
                ('status', models.CharField(choices=[('pendente', 'Pendente'), ('chamado', 'Chamado'), ('finalizado', 'Finalizado')], default='pendente', max_length=20)),
                ('criado_em', models.DateTimeField(auto_now_add=True)),
                ('chamado_em', models.DateTimeField(blank=True, null=True)),
                ('finalizado_em', models.DateTimeField(blank=True, null=True)),
                ('mesa', models.CharField(blank=True, help_text='Número da mesa do atendimento', max_length=10, null=True)),
                ('servico', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='atendimentos', to='atendimentos.servico')),
            ],
        ),
        migrations.RunPython(create_superuser),
    ]
