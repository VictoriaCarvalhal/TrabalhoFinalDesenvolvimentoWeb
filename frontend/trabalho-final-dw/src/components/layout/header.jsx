import React from 'react';
import pr3Logo from '../../assets/pr3_logo.png';

function Header() {
    return (
        <header className="container-fluid py-3 border-bottom bg-white">
            <div className="d-flex flex-column flex-md-row align-items-center justify-content-between px-3 gap-3">
                
                <div className="d-flex justify-content-center justify-content-md-start w-100" style={{ flex: 1 }}>
                    <a href='https://www.uerj.br' target="_blank" rel="noopener noreferrer"><img src={pr3Logo} alt="pr3 logo" className="img-fluid" style={{ maxWidth: '150px' }}/></a>
                </div>

                <div className="text-center w-100" style={{ flex: 2 }}>
                    <h2 className="mb-0 fs-4 fs-md-2 fw-bold" style={{ color: '#487596' }}>Sistema De Extensão</h2>
                </div>

                <div className="d-none d-md-block" style={{ flex: 1 }}></div>

            </div>
        </header>
    );
}

export default Header;