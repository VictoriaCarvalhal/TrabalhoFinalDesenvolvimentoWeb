import React from 'react';
import pr3Logo from '../../assets/pr3_logo.png';
import dirextLogo from '../../assets/dirext_logo.png';

function Header() {
    return (
        <header className="container-fluid py-3 border-bottom">
            <div className="row align-items-center justify-content-between px-3">

                {/* Coluna reduzida para col-md-3 */}
                <div className="col-4 col-md-3">
                    {/* A classe w-75 faz a imagem ocupar só 75% da coluna. Troque para w-50 se quiser menor ainda! */}
                    <img src={pr3Logo} alt="pr3 logo" className="img-fluid w-80" />
                </div>

                {/* Aumentamos o espaço do centro (col-md-6) para o título ter bastante respiro */}
                <div className="col-12 col-md-6 text-center mt-3 mt-md-0">
                    <h2 className="mb-0">Sistema De Extensão</h2>
                </div>

                {/* Coluna da direita reduzida para col-md-3 */}
                <div className="col-4 col-md-3 text-end">
                    <img src={dirextLogo} alt="dirext logo" className="img-fluid w-75" />
                </div>

            </div>
        </header>
    );
}

export default Header;