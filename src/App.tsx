import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import Home from "./components/main/Home";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Register from "./components/main/Register";
import Users from "./components/main/Users"; // เพิ่มการนำเข้า Users component

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<Register />} />
        <Route path="/users" element={<Users />} />{" "}
        {/* เพิ่มเส้นทางสำหรับ Users */}
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
