import React, { useState, useEffect } from 'react';
import { Container, Button, Typography, Paper, Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';
import axios from 'axios';
import API_ENDPOINTS from '../config/api';

const TotemAtendimento = () => {
  const [servicos, setServicos] = useState([]); // Estado para armazenar os serviços disponíveis
  const [servicoSelecionado, setServicoSelecionado] = useState(''); // Estado para armazenar o serviço selecionado
  const [senhaGerada, setSenhaGerada] = useState(null); // Estado para armazenar a senha gerada

  useEffect(() => {
    const fetchServicos = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.SERVICOS); // Faz uma requisição para obter os serviços
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
      // Obtém a mesa selecionada do localStorage
      const mesaSelecionada = localStorage.getItem("mesa") || "1";
      
      const response = await axios.post(API_ENDPOINTS.GERAR_SENHA, {
        servico_id: servicoSelecionado, // Envia o ID do serviço selecionado
        mesa: mesaSelecionada // Envia a mesa selecionada
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
          <br></br>
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
          <Box>
            <Typography variant="h5" sx={{ marginTop: 2 }}>
              Sua senha: <strong>{senhaGerada}</strong> 
            </Typography>
            <Typography variant="h5" sx={{ marginTop: 2 }}>
              Tire uma foto!
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default TotemAtendimento;