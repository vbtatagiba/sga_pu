import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, List, ListItem, ListItemText, Divider, Container } from '@mui/material';
import axios from 'axios';

const PainelChamadas = () => {
  const [dadosPainel, setDadosPainel] = useState({
    mesa1: null,
    mesa2: null,
    mesa3: null,
    historico: []
  });

  const [ultimasSenhas, setUltimasSenhas] = useState({
    mesa1: null,
    mesa2: null,
    mesa3: null
  });

  const [lendo, setLendo] = useState(false);
  const speechSynthesis = window.speechSynthesis;

  const falarSenha = (senha, mesa, servico) => {
    if (lendo) return;

    // Limpar qualquer fala anterior
    speechSynthesis.cancel();
    
    const texto = `Senha ${senha}, Mesa ${mesa}, Serviço ${servico}`;
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.pitch = 1;
    
    setLendo(true);
    
    utterance.onend = () => {
      setLendo(false);
    };
    
    speechSynthesis.speak(utterance);
  };

  const verificarNovasSenhas = (novosDados) => {
    const novasSenhas = {};
    let houveMudanca = false;
    let novaSenhaEncontrada = null;

    ['mesa1', 'mesa2', 'mesa3'].forEach(mesa => {
      const senhaAtual = novosDados[mesa]?.senha;
      const senhaAnterior = ultimasSenhas[mesa]?.senha;

      if (senhaAtual && senhaAtual !== senhaAnterior) {
        novasSenhas[mesa] = novosDados[mesa];
        houveMudanca = true;
        novaSenhaEncontrada = {
          senha: senhaAtual,
          mesa: mesa.replace('mesa', ''),
          servico: novosDados[mesa].servico_nome
        };
      } else {
        novasSenhas[mesa] = ultimasSenhas[mesa];
      }
    });

    if (houveMudanca && novaSenhaEncontrada) {
      setUltimasSenhas(novasSenhas);
      falarSenha(
        novaSenhaEncontrada.senha, 
        novaSenhaEncontrada.mesa, 
        novaSenhaEncontrada.servico
      );
    }
  };

  const fetchDadosPainel = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/atendimentos/painel_chamadas/');
      setDadosPainel(response.data);
      verificarNovasSenhas(response.data);
    } catch (error) {
      console.error("Erro ao buscar dados do painel:", error);
    }
  };

  useEffect(() => {
    fetchDadosPainel();
    const interval = setInterval(fetchDadosPainel, 3000);
    return () => {
      clearInterval(interval);
      speechSynthesis.cancel();
    };
  }, []);

  return (
    <Box sx={{ 
      padding: 3, 
      backgroundColor: 'background.default', 
      minHeight: '100vh',
      backgroundImage: 'linear-gradient(to bottom, #f0f0f0, #e0e0e0)'
    }}>
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: 'primary.main',
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
              borderBottom: '3px solid',
              borderColor: 'primary.main',
              paddingBottom: 2
            }}
          >
            Painel de Chamadas
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Painéis de chamada atual */}
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                padding: 3, 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #003366, #002244)',
                color: '#ffffff',
                height: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                Mesa 1
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  color: '#ffffff'
                }}
              >
                {dadosPainel.mesa1?.senha || 'Sem chamada'}
              </Typography>
              {dadosPainel.mesa1 && (
                <Typography variant="body1" sx={{ mt: 1, color: '#ffffff', fontWeight: 'medium' }}>
                  {dadosPainel.mesa1.servico_nome}
                </Typography>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                padding: 3, 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #009933, #006622)',
                color: '#ffffff',
                height: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                Mesa 2
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  color: '#ffffff'
                }}
              >
                {dadosPainel.mesa2?.senha || 'Sem chamada'}
              </Typography>
              {dadosPainel.mesa2 && (
                <Typography variant="body1" sx={{ mt: 1, color: '#ffffff', fontWeight: 'medium' }}>
                  {dadosPainel.mesa2.servico_nome}
                </Typography>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                padding: 3, 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #336699, #002244)',
                color: '#ffffff',
                height: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                Mesa 3
              </Typography>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  color: '#ffffff'
                }}
              >
                {dadosPainel.mesa3?.senha || 'Sem chamada'}
              </Typography>
              {dadosPainel.mesa3 && (
                <Typography variant="body1" sx={{ mt: 1, color: '#ffffff', fontWeight: 'medium' }}>
                  {dadosPainel.mesa3.servico_nome}
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Histórico de chamadas */}
          <Grid item xs={12}>
            <Paper 
              sx={{ 
                padding: 3, 
                mt: 4,
                background: 'linear-gradient(to right, #ffffff, #f9f9f9)',
                boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
              }}
            >
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  color: 'primary.main',
                  fontWeight: 'bold',
                  borderBottom: '2px solid',
                  borderColor: 'primary.main',
                  paddingBottom: 1,
                  mb: 2
                }}
              >
                Histórico de Atendimentos Finalizados
              </Typography>
              <List>
                {dadosPainel.historico.length > 0 ? (
                  dadosPainel.historico.map((atendimento, index) => (
                    <React.Fragment key={atendimento.id}>
                      <ListItem sx={{ 
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: 'rgba(0, 51, 102, 0.05)'
                        }
                      }}>
                        <ListItemText
                          primary={
                            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                              Senha: {atendimento.senha}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                              Mesa: {atendimento.mesa} | Serviço: {atendimento.servico_nome}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < dadosPainel.historico.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                          Nenhum atendimento finalizado ainda
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PainelChamadas;