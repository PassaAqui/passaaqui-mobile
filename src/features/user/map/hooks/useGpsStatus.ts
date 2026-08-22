import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getCurrentPositionAsync, LocationAccuracy } from 'expo-location';

export function useGpsStatus(lastUpdate: number) {
  const [gpsActive, setGpsActive] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /*
    Sempre que recebo uma nova atualização do lastUpdate (ou seja, o GPS está emitindo),
    eu reseto o intervalo de verificação ativa. Isso evita verificações desnecessárias
    enquanto o GPS está funcionando bem.
  */
  useEffect(() => {
    setGpsActive(true);

    // Limpa qualquer intervalo anterior pra evitar múltiplas verificações de GPS ativo
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    };

    /*
      Inicia um intervalo/timer em loop que fica sempre rodando a cada 10 segundos pra verificar se eu to recebendo
      a posição do usuário ou não
    */
    intervalRef.current = setInterval(async () => {
      try {
        await getCurrentPositionAsync({ accuracy: LocationAccuracy.Balanced });
        setGpsActive(true);
      } catch {
        setGpsActive(false);
      }
    }, 10000);
  }, [lastUpdate]);

  /* 
    Como eu to usando AppState aqui, se o usuário sair do aplicativo por exemplo, o GPS vai desativar pra evitar
    um alto consumo de bateria, aí quando ele voltar pro app, esse useEffect tenta obter posição para
    confirmar se GPS reativou ou não
  */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        getCurrentPositionAsync({ accuracy: LocationAccuracy.Balanced })
          .then(() => setGpsActive(true))
          .catch(() => setGpsActive(false));
      }
    });
    return () => subscription.remove();
  }, []);

  /*
    Para o intervalo caso o usuário saia da tela do mapa, pra evitar consumir bateria desnecessariamente
  */
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { gpsActive };
}