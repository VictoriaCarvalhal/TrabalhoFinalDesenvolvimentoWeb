import React from 'react';
import { useAuthStore } from '../../../stores/authStore';

function ParceriasInternas(){
    const isAutenticado = useAuthStore((state) => state.isAutenticado);
    const token = useAuthStore((state) => state.token);
    {/* Preciso encontrar uma forma de usar o useState() para alternar entre abas */}

    return(
        <div className="container mt-4">
            <h1>Parcerias Internas</h1>
            {/*Ao clicar em adicionar nova Parceria Interna, aparecerá o forms para a insercao dos dados necessarios. 
            Preciso encontrar uma forma de deixar o template do formulario pronto para aparecer assim que o botao for pressionado*/}
            <form>
                <div name="nome-instituicao">
                    <label for="nome-instituicao">Nome da Instituição</label><br/>
                    <input name="nome-instituicao"/>
                </div>

                <div name="sigla-instituicao">
                    <label for="sigla-instituicao">Sigla da Instituição</label><br/>
                    <input name="sigla-instituicao"/>
                </div>

                <div name="unidade">
                    <label for="unidade">Unidade</label><br/>
                    <input name="unidade"/>
                </div>

                <div name="dept">
                    <label for="dept">Departamento</label><br/>
                    <input name="dept"/>
                </div>

                <div name="participacao">
                    <label for="participacao">Participação (no máximo 5000 caracteres)</label><br/>
                    <textarea name="participacao" maxlength="5000" cols="50"/>
                </div>

            </form>

        </div>
    )
}

export default ParceriasInternas;