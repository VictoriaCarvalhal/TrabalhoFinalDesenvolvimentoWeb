import Header from "./header";
import Navbar from "./navbar";
import Footer from "./footer";
import { Outlet } from "react-router-dom";

function LayoutNotAutenticated() {
    return (
        <div id="container" className="d-flex flex-column min-vh-100 bg-white">
            <Header />
            <main className="flex-grow-1 d-flex justify-content-center align-items-center px-4 py-4" style={{ order: 0 }}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

export default LayoutNotAutenticated;