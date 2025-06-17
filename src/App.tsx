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
import Department from "./components/main/Department";
import Role from "./components/main/Roles";
import Students from "./components/main/Students";
import StudentsData from "./components/main/StudentsData";
import TeachersData from "./components/main/TeacherData";
import Teachers from "./components/main/Teacher";
import Building from "./components/main/Building";

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
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/department" element={<Department />} />
        <Route path="/roles" element={<Role />} />
        <Route path="/students" element={<Students />} />
        <Route path="/studentsData" element={<StudentsData />} />
        <Route path="/teacher" element={<Teachers />} />
        <Route path="/teacherData" element={<TeachersData />} />
        <Route path="/building" element={<Building />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
