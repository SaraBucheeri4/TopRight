import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LangProvider, useLang } from "./LangContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Work from "./pages/Work";
import Services from "./pages/Services";
import About from "./pages/About";
import Coaching from "./pages/Coaching";
import Events from "./pages/Events";
import Contact from "./pages/Contact";
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
