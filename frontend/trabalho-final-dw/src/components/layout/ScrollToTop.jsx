import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Sem isso o BrowserRouter mantém a posição do scroll ao trocar de rota.
// Como /bemvindo e a antiga /Projetos/SeusProjetos renderizam a mesma lista,
// o usuário trocava de URL no meio da página e achava que nada aconteceu.
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
