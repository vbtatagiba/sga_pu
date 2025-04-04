import React, { useState } from 'react';
import { Container, Button, Typography, Paper } from '@mui/material';
import axios from 'axios';

const Chamador = () => {
  const [ultimaChamada, setUltimaChamada] = useState(null);

  const chamarProximo = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/atendimentos/chamar_proximo/');
      setUltimaChamada(response.data);
    } catch (error) {
      console.error('Erro ao chamar próximo:', error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" align="center" gutterBottom>
        Chamador de Senhas
      </Typography>
      <Paper elevation={3} sx={{ padding: 3, textAlign: 'center' }}>
        {ultimaChamada ? (
          <>
            <Typography variant="h5">
              Senha: <strong>{ultimaChamada.senha}</strong>
            </Typography>
            <Typography variant="h6">Mesa: {ultimaChamada.mesa}</Typography>
          </>
        ) : (
          <Typography variant="h6">Nenhuma senha chamada ainda</Typography>
        )}
        <Button variant="contained" color="primary" onClick={chamarProximo} sx={{ marginTop: 2 }}>
          Chamar Próximo
        </Button>
      </Paper>
    </Container>
  );
};

export default Chamador;
