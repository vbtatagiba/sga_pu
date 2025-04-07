import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, Grid, List, ListItem, ListItemText, Divider, Container } from '@mui/material';
import axios from 'axios';
import { API_KEYS } from '../config/api-keys';

const PainelChamadas = () => {
  const [dadosPainel, setDadosPainel] = useState({
    mesa1: null,
    mesa2: null,
    mesa3: null,
    historico: [] // Estado para armazenar dados do painel
  });

  const [ultimasSenhas, setUltimasSenhas] = useState({
    mesa1: null,
    mesa2: null,
    mesa3: null // Estado para armazenar as últimas senhas chamadas
  });

  const [lendo, setLendo] = useState(false); // Estado para controlar a leitura de senhas
  const [ultimaSenhaFalada, setUltimaSenhaFalada] = useState(null); // Estado para controlar a última senha falada
  const [tempoUltimaFala, setTempoUltimaFala] = useState(0); // Estado para controlar o tempo da última fala
  const [bloqueioFala, setBloqueioFala] = useState(false); // Estado para bloquear a fala temporariamente
  const [audioPlayer, setAudioPlayer] = useState(null); // Estado para armazenar o player de áudio
  
  // Referências para controlar o estado da fala
  const falandoRef = useRef(false);
  const ultimaSenhaRef = useRef(null);
  const tempoUltimaFalaRef = useRef(0);
  const bloqueioFalaRef = useRef(false);
  const audioPlayerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Chave da API do Google Cloud
  const API_KEY = API_KEYS.GOOGLE_CLOUD_API_KEY;
  
  const falarSenha = async (senha, mesa, servico) => {
    // Verifica se já está lendo ou se está bloqueado usando as refs
    if (falandoRef.current || bloqueioFalaRef.current) {
      console.log("Já está falando ou bloqueado, ignorando nova fala");
      return;
    }
    
    // Verifica se a senha é a mesma da última falada e se passou menos de 5 segundos
    const agora = Date.now();
    if (ultimaSenhaRef.current === senha && agora - tempoUltimaFalaRef.current < 5000) {
      console.log("Senha repetida, ignorando fala");
      return;
    }
    
    // Cancela qualquer áudio anterior
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
    
    // Cancela qualquer timeout pendente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    const texto = `Senha ${senha}, Mesa ${mesa}, Serviço ${servico}`;
    
    try {
      // Atualiza os estados antes de falar
      setLendo(true);
      setUltimaSenhaFalada(senha);
      setTempoUltimaFala(agora);
      setBloqueioFala(true);
      
      // Atualiza as refs
      falandoRef.current = true;
      ultimaSenhaRef.current = senha;
      tempoUltimaFalaRef.current = agora;
      bloqueioFalaRef.current = true;
      
      // Configura a requisição para a API REST do Google Text-to-Speech
      const requestBody = {
        input: { text: texto },
        voice: { languageCode: 'pt-BR', name: 'pt-BR-Standard-A' },
        audioConfig: { audioEncoding: 'MP3' }
      };
      
      // Faz a requisição para a API REST
      const response = await axios.post(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Converte o áudio para um formato que pode ser reproduzido
      const audioContent = response.data.audioContent;
      const audioSrc = `data:audio/mp3;base64,${audioContent}`;
      
      // Cria um novo elemento de áudio
      const newAudioPlayer = new Audio(audioSrc);
      
      // Configura os eventos de fim e erro
      newAudioPlayer.onended = () => {
        console.log("Fala concluída");
        setLendo(false);
        falandoRef.current = false;
        
        // Libera o bloqueio após 2 segundos
        timeoutRef.current = setTimeout(() => {
          setBloqueioFala(false);
          bloqueioFalaRef.current = false;
        }, 2000);
      };
      
      newAudioPlayer.onerror = (event) => {
        console.error("Erro na fala:", event);
        setLendo(false);
        setBloqueioFala(false);
        falandoRef.current = false;
        bloqueioFalaRef.current = false;
      };
      
      // Armazena o player no estado e na ref
      setAudioPlayer(newAudioPlayer);
      audioPlayerRef.current = newAudioPlayer;
      
      // Inicia a reprodução
      newAudioPlayer.play();
      
      // Timeout de segurança para garantir que o estado seja resetado
      timeoutRef.current = setTimeout(() => {
        if (falandoRef.current) {
          if (audioPlayerRef.current) {
            audioPlayerRef.current.pause();
            audioPlayerRef.current.currentTime = 0;
          }
          setLendo(false);
          setBloqueioFala(false);
          falandoRef.current = false;
          bloqueioFalaRef.current = false;
        }
      }, 6000);
    } catch (error) {
      console.error("Erro ao gerar áudio:", error);
      setLendo(false);
      setBloqueioFala(false);
      falandoRef.current = false;
      bloqueioFalaRef.current = false;
    }
  };
  
  const verificarNovasSenhas = (novosDados) => {
    const novasSenhas = {};
    let novaSenhaParaFalar = null;
  
    ['mesa1', 'mesa2', 'mesa3'].forEach(mesa => {
      const senhaAtual = novosDados[mesa]?.senha;
      const senhaAnterior = ultimasSenhas[mesa]?.senha;
  
      if (senhaAtual && senhaAtual !== senhaAnterior) {
        novasSenhas[mesa] = novosDados[mesa];
        // Apenas a primeira mudança encontrada será falada
        if (!novaSenhaParaFalar) {
          novaSenhaParaFalar = {
            senha: senhaAtual,
            mesa: mesa.replace('mesa', ''),
            servico: novosDados[mesa].servico_nome
          };
        }
      } else {
        novasSenhas[mesa] = ultimasSenhas[mesa];
      }
    });
  
    // Atualiza as últimas senhas chamadas
    setUltimasSenhas(novasSenhas);
  
    // Se houver uma nova senha a ser falada e ela for diferente da última lida, então fala.
    if (novaSenhaParaFalar && ultimaSenhaRef.current !== novaSenhaParaFalar.senha) {
      setUltimaSenhaFalada(novaSenhaParaFalar.senha);
      falarSenha(novaSenhaParaFalar.senha, novaSenhaParaFalar.mesa, novaSenhaParaFalar.servico);
    }
  };

  const fetchDadosPainel = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/atendimentos/painel_chamadas/');
      setDadosPainel(response.data); // Atualiza os dados do painel
      verificarNovasSenhas(response.data); // Verifica novas senhas
    } catch (error) {
      console.error("Erro ao buscar dados do painel:", error); // Log de erro
    }
  };

  useEffect(() => {
    // Inicializa as refs com os valores iniciais
    falandoRef.current = lendo;
    ultimaSenhaRef.current = ultimaSenhaFalada;
    tempoUltimaFalaRef.current = tempoUltimaFala;
    bloqueioFalaRef.current = bloqueioFala;
    audioPlayerRef.current = audioPlayer;
    
    fetchDadosPainel(); // Chama a função ao montar o componente
    const interval = setInterval(fetchDadosPainel, 3000); // Atualiza os dados a cada 3 segundos
    return () => {
      clearInterval(interval); // Limpa o intervalo ao desmontar
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.currentTime = 0;
      }
    };
  }, []);

  return (
    <Box sx={{ 
      padding: 3, 
      backgroundColor: 'background.default', 
      minHeight: '100vh',
      backgroundImage: 'linear-gradient(to bottom, #f0f0f0, #e0e0e0)' // Estilo de fundo
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
                background: 'linear-gradient(135deg, #336699, #002244)',
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
                          backgroundColor: 'rgba(0, 51, 102, 0.05)' // Efeito de hover
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
                      {index < dadosPainel.historico.length - 1 && <Divider />} // Divide os itens da lista
                    </React.Fragment>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                          Nenhum atendimento finalizado ainda {/* Mensagem padrão se não houver atendimentos*/}
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