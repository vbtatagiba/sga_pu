import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, Grid, List, ListItem, ListItemText, Divider, Container, img} from '@mui/material';
import axios from 'axios';
import { API_KEYS } from '../config/api-keys';
import API_ENDPOINTS from '../config/api';
import PropTypes from 'prop-types';

// Schema de validação
const MesaSchema = {
  senha: PropTypes.string,
  servico_nome: PropTypes.string
};

// Corrigido: Simplesmente retorna os dados da API se existirem e tiverem ID,
// ou null caso contrário. Preserva todos os campos.
const validateMesaData = (data) => {
  // Se data existir e tiver um id, retorna um clone superficial para evitar mutações.
  // Caso contrário, retorna null.
  return data && data.id ? { ...data } : null;
};

const PainelChamadas = () => {
  const [dadosPainel, setDadosPainel] = useState({
    mesa1: null,
    mesa2: null,
    mesa3: null,
    historico: []
  });

  const [lendo, setLendo] = useState(false);
  const [autoplayPermitido, setAutoplayPermitido] = useState(false);
  const [senhasParaFalar, setSenhasParaFalar] = useState([]);
  
  // Referências para controlar o estado da fala
  const falandoRef = useRef(false);
  const senhasParaFalarRef = useRef([]);
  const audioPlayerRef = useRef(null);

  const [horaAtual, setHoraAtual] = useState(new Date());

  // Chave da API do Google Cloud
  const API_KEY = API_KEYS.GOOGLE_CLOUD_API_KEY;
  
  const falarSenha = async (senha, mesa, servico) => {
    if (!senha) return;
    
    const texto = `Senha ${senha}, Mesa ${mesa}, Serviço ${servico}`;
    
    try {
      const response = await axios.post(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`,
        {
          input: { text: texto },
          voice: { languageCode: 'pt-BR', name: 'pt-BR-Wavenet-B' },
          audioConfig: { audioEncoding: 'MP3' }
        }
      );

      const audio = new Audio(`data:audio/mp3;base64,${response.data.audioContent}`);
      audio.muted = !autoplayPermitido;
      
      await audio.play();
      audio.muted = false;

      return new Promise(resolve => {
        audio.onended = resolve;
        audio.onerror = resolve;
      });

    } catch (error) {
      console.error("Erro na síntese de fala:", error);
      return Promise.resolve();
    }
  };

  const processarFila = async () => {
    if (senhasParaFalarRef.current.length === 0 || falandoRef.current) return;

    falandoRef.current = true;
    setLendo(true);

    while (senhasParaFalarRef.current.length > 0) {
      const proximaSenha = senhasParaFalarRef.current[0]; 
      
      await new Promise(resolve => {
        falarSenha(proximaSenha.senha, proximaSenha.mesa, proximaSenha.servico_nome || proximaSenha.servico) // Usa servico_nome ou servico
          .finally(() => {
            senhasParaFalarRef.current = senhasParaFalarRef.current.slice(1);
            setSenhasParaFalar(senhasParaFalarRef.current);
            resolve();
          });
      });

      if (proximaSenha.status === 'chamado') {
        try {
          await axios.put(
            `${API_ENDPOINTS.ATENDIMENTOS}/${proximaSenha.id}/iniciar-atendimento/`
          );
        } catch (error) {
          console.error(`Erro ao iniciar atendimento para ${proximaSenha.id}:`, error);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    falandoRef.current = false;
    setLendo(false);
  };
  
  const verificarNovasSenhas = (novosDados) => {
    const senhasParaAdicionarAFila = [];
  
    ['mesa1', 'mesa2', 'mesa3'].forEach(mesaKey => {
      const dadosMesaAtual = novosDados[mesaKey];
      const dadosMesaAnterior = dadosPainel[mesaKey];

      if (dadosMesaAtual && dadosMesaAtual.status === 'chamado' && 
          (!dadosMesaAnterior || dadosMesaAtual.id !== dadosMesaAnterior.id)) {
        
        const jaNaFilaDeProcessamento = senhasParaFalarRef.current.some(s => s.id === dadosMesaAtual.id);
        const jaNaListaParaAdicionarAgora = senhasParaAdicionarAFila.some(s => s.id === dadosMesaAtual.id);

        if (!jaNaFilaDeProcessamento && !jaNaListaParaAdicionarAgora) {
          // Adiciona uma cópia com os campos mínimos necessários para falar e processar,
          // garantindo a estrutura correta.
          senhasParaAdicionarAFila.push({
            id: dadosMesaAtual.id,
            senha: dadosMesaAtual.senha,
            status: dadosMesaAtual.status, // Importante para processarFila
            mesa: mesaKey.replace('mesa', ''), 
            servico_nome: dadosMesaAtual.servico_nome || 'Serviço Geral' // Para falarSenha
          });
        }
      }
    });
  
    if (senhasParaAdicionarAFila.length > 0) {
      const novaFilaCompleta = [...senhasParaFalarRef.current, ...senhasParaAdicionarAFila];
      setSenhasParaFalar(novaFilaCompleta);
      senhasParaFalarRef.current = novaFilaCompleta;
      
      if (!falandoRef.current) {
        processarFila();
      }
    }
  };

  const fetchDadosPainel = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.PAINEL_CHAMADAS);
      
      if (!response?.data || typeof response.data !== 'object') {
        console.error("Resposta inválida da API:", response);
        return;
      }

      const dadosBrutos = response.data;
      const dadosValidados = {
        mesa1: validateMesaData(dadosBrutos.mesa1),
        mesa2: validateMesaData(dadosBrutos.mesa2),
        mesa3: validateMesaData(dadosBrutos.mesa3),
        historico: Array.isArray(dadosBrutos.historico) 
          ? dadosBrutos.historico.filter(item => 
              item?.id && item?.senha && item?.mesa && item?.servico_nome
            )
          : []
      };

      setDadosPainel(dadosValidados);
      verificarNovasSenhas(dadosValidados);
    } catch (error) {
      console.error("Erro ao buscar dados do painel:", error);
    }
  };

  useEffect(() => {
    const verificarAutoplay = async () => {
      try {
        const audio = new Audio();
        audio.muted = true;
        await audio.play();
        audio.pause();
        setAutoplayPermitido(true);
      } catch (error) {
        console.log("Autoplay bloqueado, aguardando interação");
      }
    };
    
    const fetchInterval = setInterval(fetchDadosPainel, 3000);
    const relogioInterval = setInterval(() => setHoraAtual(new Date()), 1000);
    
    verificarAutoplay();
    fetchDadosPainel();
    
    return () => {
      clearInterval(fetchInterval);
      clearInterval(relogioInterval);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    };
  }, []);

  return (
    <Box 
      onClick={() => {
        if (!autoplayPermitido) {
          const audio = new Audio();
          audio.muted = true;
          audio.play()
            .then(() => {
              audio.pause();
              setAutoplayPermitido(true);
            })
            .catch(error => console.error("Erro ao destravar autoplay:", error));
        }
      }}
      sx={{ 
      padding: 3, 
      backgroundColor: 'background.default', 
      minHeight: '100vh',
      backgroundImage: 'linear-gradient(to bottom, #f0f0f0, #e0e0e0)',
      display: 'flex',
        justifyContent: 'center',
        cursor: 'pointer'
      }}
    >
      <Container maxWidth="lg" sx={{ width: '100%' }}>

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
          <Typography 
            variant="h2" 
            sx={{ 
              color: 'primary.main',
              paddingLeft: "-200  px",
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            {horaAtual.toLocaleTimeString('pt-BR')}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Painéis de chamada atual */}
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                padding: 3, 
                textAlign: 'center',
                background: 'linear-gradient(135deg,rgb(97, 166, 235), #002244)',
                color: '#ffffff',
                height: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)' // Efeito de hover
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
                  transform: 'translateY(-5px)' // Efeito de hover
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
                background: 'linear-gradient(135deg,rgb(140, 26, 59),rgb(44, 5, 5))',
                color: '#ffffff',
                height: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)' // Efeito de hover
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
          <Grid item xs={12}sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center', // Centraliza verticalmente
              width: '100%',
              minHeight: '50vh' // Ajuda na centralização vertical
            }}>
            
              <Paper 
                sx={{ 
                  padding: 3, 
                  mt: 4,
                  width: '100%',
                  maxWidth: '800px',
                  background: 'linear-gradient(to right, #ffffff, #f9f9f9)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
                  margin: 'auto' // Ajuda na centralização
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
                    mb: 2,
                    textAlign: 'center'
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
                              <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold', textAlign: 'center' }}>
                                Senha: {atendimento.senha}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center' }}>
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