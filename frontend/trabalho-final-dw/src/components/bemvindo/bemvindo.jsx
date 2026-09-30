import { useAuthStore } from '../../stores/authStore';
import Projetos from '../projetos/seusprojetos/projetos';

function Bemvindo() {
    const nomeUsuario = useAuthStore((state) => state.nomeUsuario);

    return (
        <div>
            <div>
                <h1>Bem Vindo, {nomeUsuario ? `${nomeUsuario}` : ''}</h1>
            </div>
            

            <div className ="mt-5">
                <h3 className = "mb-3">Últimos Projetos</h3>
                <Projetos isPrevia={true} limite={5}/>
            </div>
        </div>
    );
}

export default Bemvindo;