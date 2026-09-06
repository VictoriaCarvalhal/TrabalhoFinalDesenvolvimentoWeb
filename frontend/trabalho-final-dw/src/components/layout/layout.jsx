import Header from "./header";
import Navbar from "./navbar";
import Footer from "./footer";
import { Outlet } from "react-router-dom";

function Layout() {
    return (
        <>
            <div className="Layout">
                <Header />
                <Navbar />
                <Outlet />
                <Footer />
            </div>
        </>
    );
}

export default Layout;