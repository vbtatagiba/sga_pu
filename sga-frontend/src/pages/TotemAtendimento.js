import React, { useState, useEffect } from 'react';
import { Container, Button, Typography, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';

const TotemAtendimento = () => {
  const [servicos, setServicos] = useState([]);
  const [servicoSelecionado, setServicoSelecionado] = useState('');
  const [senhaGerada, setSenhaGerada] = useState(null);

  useEffect(() => {
    const fetchServicos = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/servicos/');
        setServicos(response.data);
      } catch (error) {
        console.error('Erro ao buscar serviços:', error);
      }
    };

    fetchServicos();
  }, []);

  const gerarSenha = async () => {
    if (!servicoSelecionado) return;
    
    try {
      const response = await axios.post('http://localhost:8000/api/atendimentos/gerar_senha/', {
        servico_id: servicoSelecionado,
      });
      setSenhaGerada(response.data.senha);
    } catch (error) {
      console.error('Erro ao gerar senha:', error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" align="center" gutterBottom>
        Totem de Atendimento
      </Typography>
      <Paper elevation={3} sx={{ padding: 3, textAlign: 'center' }}>
        <FormControl fullWidth>
          <InputLabel>Selecione um Serviço</InputLabel>
          <Select value={servicoSelecionado} onChange={(e) => setServicoSelecionado(e.target.value)}>
            {servicos.map((servico) => (
              <MenuItem key={servico.id} value={servico.id}>
                {servico.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={gerarSenha} sx={{ marginTop: 2 }}>
          Gerar Senha
        </Button>
        {senhaGerada && (
          <Typography variant="h5" sx={{ marginTop: 2 }}>
            Sua senha: <strong>{senhaGerada}</strong>
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default TotemAtendimento;
