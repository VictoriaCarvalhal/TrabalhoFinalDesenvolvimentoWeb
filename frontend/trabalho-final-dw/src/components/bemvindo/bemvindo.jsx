import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import Projetos from '../projetos/seusprojetos/projetos';

function Bemvindo() {
    const nomeUsuario = useAuthStore((state) => state.nomeUsuario);
    const localizacao = useLocation();

    const chaveLista = localizacao.state?.recarregarEm ?? 'lista';

    return (
        <div>
            <p className="h6 text-body-secondary mb-1">
                Bem Vindo, {nomeUsuario ? `${nomeUsuario}` : ''}
            </p>

            <h2 className="h4 mb-3">Seus Projetos</h2>
            <Projetos key={chaveLista} />
        </div>
    );
}

export default Bemvindo;
