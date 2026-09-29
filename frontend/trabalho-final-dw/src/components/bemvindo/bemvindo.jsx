import { useAuthStore } from '../../stores/authStore';

function Bemvindo() {
    const nomeUsuario = useAuthStore((state) => state.nomeUsuario);

    return (
        <div>
            <h1>Bem Vindo {nomeUsuario ? `${nomeUsuario}` : ''}</h1>
        </div>
    );
}

export default Bemvindo;