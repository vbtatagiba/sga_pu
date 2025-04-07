import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, Grid, List, ListItem, ListItemText, Divider, Container } from '@mui/material';
import axios from 'axios';
import { API_KEYS } from '../config/api-keys';
import API_ENDPOINTS from '../config/api';

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
  const [autoplayPermitido, setAutoplayPermitido] = useState(false); // Estado para controlar se o autoplay é permitido
  const [senhasParaFalar, setSenhasParaFalar] = useState([]); // Lista de senhas a serem faladas
  
  // Referências para controlar o estado da fala
  const falandoRef = useRef(false);
  const ultimaSenhaRef = useRef(null);
  const tempoUltimaFalaRef = useRef(0);
  const bloqueioFalaRef = useRef(false);
  const audioPlayerRef = useRef(null);
  const timeoutRef = useRef(null);
  const senhasParaFalarRef = useRef([]); // Referência para a lista de senhas a serem faladas

  // Chave da API do Google Cloud
  const API_KEY = API_KEYS.GOOGLE_CLOUD_API_KEY;
  
  const falarSenha = async (senha, mesa, servico) => {
    const agora = new Date();
    
    // Verifica se já está falando ou se está bloqueado
    if (falandoRef.current || bloqueioFalaRef.current) {
      console.log("Já está falando ou bloqueado, ignorando nova fala");
      return;
    }
    
    // Verifica se a senha é a mesma da última falada
    if (ultimaSenhaRef.current === senha) {
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
        voice: { languageCode: 'pt-BR', name: 'pt-BR-Chirp3-HD-Charon' },
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
      
      // Inicialmente, o áudio deve ser mudo para garantir que a reprodução aconteça automaticamente
      newAudioPlayer.muted = true;
      
      // Configura os eventos de fim e erro
      newAudioPlayer.onended = () => {
        console.log("Fala concluída");
        setLendo(false);
        falandoRef.current = false;
        
        // Remove a senha da lista de senhas para falar
        const senhasAtualizadas = senhasParaFalarRef.current.filter(s => s.senha !== senha);
        setSenhasParaFalar(senhasAtualizadas);
        senhasParaFalarRef.current = senhasAtualizadas;
        
        // Libera o bloqueio após 1 segundo
        timeoutRef.current = setTimeout(() => {
          setBloqueioFala(false);
          bloqueioFalaRef.current = false;
          
          // Verifica se há mais senhas para falar
          if (senhasAtualizadas.length > 0) {
            // Fala a próxima senha após 1 segundo
            setTimeout(() => {
              const proximaSenha = senhasAtualizadas[0];
              falarSenha(proximaSenha.senha, proximaSenha.mesa, proximaSenha.servico);
            }, 1000);
          }
        }, 1000);
      };
      
      newAudioPlayer.onerror = (event) => {
        console.error("Erro na fala:", event);
        setLendo(false);
        setBloqueioFala(false);
        falandoRef.current = false;
        bloqueioFalaRef.current = false;
        
        // Remove a senha da lista de senhas para falar mesmo em caso de erro
        const senhasAtualizadas = senhasParaFalarRef.current.filter(s => s.senha !== senha);
        setSenhasParaFalar(senhasAtualizadas);
        senhasParaFalarRef.current = senhasAtualizadas;
      };
      
      // Armazena o player no estado e na ref
      setAudioPlayer(newAudioPlayer);
      audioPlayerRef.current = newAudioPlayer;
      
      // Tenta iniciar a reprodução
      newAudioPlayer.play().then(() => {
        // Se a reprodução começar, você pode desmutar o áudio
        newAudioPlayer.muted = false;
      }).catch((error) => {
        console.error("Erro ao iniciar reprodução:", error);
        setLendo(false);
        setBloqueioFala(false);
        falandoRef.current = false;
        bloqueioFalaRef.current = false;
        
        // Remove a senha da lista de senhas para falar mesmo em caso de erro
        const senhasAtualizadas = senhasParaFalarRef.current.filter(s => s.senha !== senha);
        setSenhasParaFalar(senhasAtualizadas);
        senhasParaFalarRef.current = senhasAtualizadas;
      });
    } catch (error) {
      console.error("Erro ao gerar fala:", error);
      setLendo(false);
      setBloqueioFala(false);
      falandoRef.current = false;
      bloqueioFalaRef.current = false;
      
      // Remove a senha da lista de senhas para falar mesmo em caso de erro
      const senhasAtualizadas = senhasParaFalarRef.current.filter(s => s.senha !== senha);
      setSenhasParaFalar(senhasAtualizadas);
      senhasParaFalarRef.current = senhasAtualizadas;
    }
  };
  
  const verificarNovasSenhas = (novosDados) => {
    const novasSenhas = {};
    const novasSenhasParaFalar = [];
  
    ['mesa1', 'mesa2', 'mesa3'].forEach(mesa => {
      const senhaAtual = novosDados[mesa]?.senha;
      const senhaAnterior = ultimasSenhas[mesa]?.senha;
  
      if (senhaAtual && senhaAtual !== senhaAnterior) {
        novasSenhas[mesa] = novosDados[mesa];
        // Adiciona a nova senha à lista de senhas para falar
        novasSenhasParaFalar.push({
          senha: senhaAtual,
          mesa: mesa.replace('mesa', ''),
          servico: novosDados[mesa].servico_nome
        });
      } else {
        novasSenhas[mesa] = ultimasSenhas[mesa];
      }
    });
  
    // Atualiza as últimas senhas chamadas
    setUltimasSenhas(novasSenhas);
  
    // Adiciona as novas senhas à lista de senhas para falar
    if (novasSenhasParaFalar.length > 0) {
      // Filtra senhas que já estão na lista
      const senhasNovas = novasSenhasParaFalar.filter(
        novaSenha => !senhasParaFalarRef.current.some(
          senhaExistente => senhaExistente.senha === novaSenha.senha
        )
      );
      
      if (senhasNovas.length > 0) {
        // Atualiza a lista de senhas para falar
        const senhasAtualizadas = [...senhasParaFalarRef.current, ...senhasNovas];
        setSenhasParaFalar(senhasAtualizadas);
        senhasParaFalarRef.current = senhasAtualizadas;
        
        // Se não estiver falando, inicia a fala da primeira senha
        if (!falandoRef.current && !bloqueioFalaRef.current) {
          falarSenha(senhasNovas[0].senha, senhasNovas[0].mesa, senhasNovas[0].servico);
        }
      }
    }
  };

  const fetchDadosPainel = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.PAINEL_CHAMADAS);
      
      // Verifica se há mudanças nos dados antes de atualizar
      const dadosAtuais = response.data;
      const dadosAnteriores = dadosPainel;
      
      // Verifica se há mudanças nas senhas chamadas
      const mudancasSenhas = 
        dadosAtuais.mesa1?.senha !== dadosAnteriores.mesa1?.senha ||
        dadosAtuais.mesa2?.senha !== dadosAnteriores.mesa2?.senha ||
        dadosAtuais.mesa3?.senha !== dadosAnteriores.mesa3?.senha;
      
      // Atualiza os dados do painel
      setDadosPainel(dadosAtuais);
      
      // Verifica novas senhas apenas se houver mudanças
      if (mudancasSenhas) {
        verificarNovasSenhas(dadosAtuais);
      }
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
    senhasParaFalarRef.current = senhasParaFalar;
    
    // Função para verificar se o navegador suporta autoplay
    const verificarAutoplay = async () => {
      try {
        // Tenta reproduzir um áudio mudo para verificar se o autoplay é permitido
        const audio = new Audio();
        audio.muted = true;
        await audio.play();
        audio.pause();
        audio.currentTime = 0;
        
        // Se chegou aqui, o autoplay é permitido
        setAutoplayPermitido(true);
      } catch (error) {
        // Se houve erro, o autoplay não é permitido
        console.error("Autoplay não permitido:", error);
        setAutoplayPermitido(false);
      }
    };
    
    // Verifica se o autoplay é permitido
    verificarAutoplay();
    
    // Chama a função ao montar o componente
    fetchDadosPainel();
    
    // Atualiza os dados a cada 3 segundos
    const interval = setInterval(() => {
      // Só atualiza se não estiver falando e não estiver bloqueado
      if (!falandoRef.current && !bloqueioFalaRef.current) {
        fetchDadosPainel();
      }
    }, 3000);
    
    // Limpa o intervalo ao desmontar
    return () => {
      clearInterval(interval);
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
                      {index < dadosPainel.historico.length - 1 && <Divider />} 
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