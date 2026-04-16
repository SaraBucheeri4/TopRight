import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LangProvider, useLang } from "./LangContext";
import Navbar from "./components/public/Navbar";
import Footer from "./components/public/Footer";
import Home from "./pages/public/Home";
import Work from "./pages/public/Work";
import Services from "./pages/public/Services";
import About from "./pages/public/About";
import Coaching from "./pages/public/Coaching";
import Events from "./pages/public/Events";
import Contact from "./pages/public/Contact";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import ProtectedRoute from "./components/admin/ProtectedRoute";

function AppInner() {
  const { lang } = useLang();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <div className="tbar" />}
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/work" element={<Work />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/coaching" element={<Coaching />} />
        <Route path="/events" element={<Events />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
      {!isAdmin && <Footer />}
      {!isAdmin && <div className="tbar" />}
    </>
  );
}

export default function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </LangProvider>
  );
}
