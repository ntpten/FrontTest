import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const [user, setUser] = useState<any | null>(null); // เก็บค่า user จาก localStorage
  const navigate = useNavigate();

  // ตรวจสอบข้อมูล user เมื่อ component ถูก mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser)); // ตั้งค่า user จาก localStorage
      } catch (error) {
        console.error("Error parsing user data from localStorage", error);
        setUser(null); // ถ้า parsing ล้มเหลว, ตั้งค่า user เป็น null
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user"); // ลบข้อมูล user ออกจาก localStorage
    setUser(null); // อัปเดต state user ให้เป็น null
    navigate("/login"); // เปลี่ยนเส้นทางไปหน้า login
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          My Application
        </Typography>
        <Box>
          {!user ? ( // ถ้ายังไม่ได้ล็อกอิน
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          ) : (
            // ถ้าล็อกอินแล้ว
            <>
              <Button color="inherit" component={Link} to="/">
                Home
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
