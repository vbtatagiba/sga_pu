import React, { useState, useEffect } from 'react';
import { Container, Button, Typography, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';

const TotemAtendimento = () => {
  const [servicos, setServicos] = useState([]); // Estado para armazenar os serviços disponíveis
  const [servicoSelecionado, setServicoSelecionado] = useState(''); // Estado para armazenar o serviço selecionado
  const [senhaGerada, setSenhaGerada] = useState(null); // Estado para armazenar a senha gerada

  useEffect(() => {
    const fetchServicos = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/servicos/'); // Faz uma requisição para obter os serviços
        setServicos(response.data); // Atualiza o estado com os serviços recebidos
      } catch (error) {
        console.error('Erro ao buscar serviços:', error); // Log de erro
      }
    };

    fetchServicos(); // Chama a função para buscar serviços
  }, []);

  const gerarSenha = async () => {
    if (!servicoSelecionado) return; // Verifica se um serviço foi selecionado
    
    try {
      const response = await axios.post('http://localhost:8000/api/atendimentos/gerar_senha/', {
        servico_id: servicoSelecionado, // Envia o ID do serviço selecionado
      });
      setSenhaGerada(response.data.senha); // Atualiza o estado com a senha gerada
    } catch (error) {
      console.error('Erro ao gerar senha:', error); // Log de erro
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
                {servico.nome} // Exibe o nome do serviço
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={gerarSenha} sx={{ marginTop: 2 }}>
          Gerar Senha
        </Button>
        {senhaGerada && (
          <Typography variant="h5" sx={{ marginTop: 2 }}>
            Sua senha: <strong>{senhaGerada}</strong> // Exibe a senha gerada
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default TotemAtendimento;