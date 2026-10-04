import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import Projetos from '../projetos/seusprojetos/projetos';

function Bemvindo() {
    const nomeUsuario = useAuthStore((state) => state.nomeUsuario);
    const localizacao = useLocation();

    // A lista fica aqui por exigência do cliente. O `key` força remontagem
    // quando o usuário clica em Início já estando nesta página
    // (navbar envia state.recarregarEm), zerando busca/página.
    const chaveLista = localizacao.state?.recarregarEm ?? 'lista';

    return (
        <div>
            <div>
                <h1>Bem Vindo, {nomeUsuario ? `${nomeUsuario}` : ''}</h1>
            </div>


            <div className ="mt-5">
                <h3 className = "mb-3">Seus Projetos</h3>
                <Projetos key={chaveLista} />
            </div>
        </div>
    );
}

export default Bemvindo;
