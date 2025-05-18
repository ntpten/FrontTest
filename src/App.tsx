import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import Home from "./components/main/Home";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Register from "./components/main/Register";
import Users from "./components/main/Users";
import Unauthorized from "./components/main/Unauthorized";
import Faculty from "./components/main/Faculty";

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<Register />} />
        <Route path="/users" element={<Users />} />{" "}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/faculty" element={<Faculty/>} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
