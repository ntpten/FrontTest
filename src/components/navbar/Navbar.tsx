import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

interface User {
  users_id: number;
  username: string;
  password: string;
  roles_id: number; // `roles_id` ควรเป็น number
  roles_name: string;
}

const Navbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loggingOut, setLoggingOut] = useState<boolean>(false); // ✅ เพิ่ม
  const navigate = useNavigate(); // ใช้ navigate สำหรับการเปลี่ยนเส้นทาง

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser && storedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser); // ตั้งค่า user จาก localStorage
      } catch (error) {
        console.error("Error parsing user data from localStorage", error);
        setUser(null);
        navigate("/login"); // ถ้าเกิดข้อผิดพลาดในการดึงข้อมูล user จาก localStorage ให้ redirect ไปที่ login
      }
    } else {
      setUser(null);
      navigate("/login"); // ถ้าไม่มีข้อมูล user ให้ redirect ไปที่ login
    }
  }, [navigate]); // ให้ run แค่ครั้งเดียวเมื่อ component ถูก mount

  const handleLogout = async () => {
    setLoggingOut(true); // เริ่มแสดง loading
    try {
      await axios.get("http://localhost:3001/logout", {
        withCredentials: true,
      });
      localStorage.removeItem("user");
      setUser(null);

      // หน่วงเวลาให้การ logout เสร็จสมบูรณ์ก่อน
      setTimeout(() => {
        navigate("/login");

        // รอ 1 วินาทีหลังจากไปที่หน้า /login
        setTimeout(() => {
          window.location.reload(); // รีเฟรชหน้า
          setLoggingOut(false); // รีเซ็ตสถานะการล็อกเอาท์เป็น false หลังจากรีเฟรชหน้าแล้ว
        }, 300); // รอ 1 วินาทีหลังจากไปที่หน้า /login
      }, 3000); // ลดเวลาเป็น 3 วินาที เพื่อให้การ logout เสร็จสมบูรณ์
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
      navigate("/login");
    }
  };

  // กรณีที่ออกจากระบบหรือเกิดข้อผิดพลาด จะถูกแสดง loading
  if (loggingOut) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          กำลังออกจากระบบ...
        </Typography>
      </Box>
    );
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          My Application
        </Typography>
        <Box>
          {!user ? (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/">
                Home
              </Button>

              {/* ปุ่ม Users จะแสดงเมื่อ roles_id เป็น 1 */}
              {user?.roles_id === 1 && (
                <>
                  <Button color="inherit" component={Link} to="/users">
                    Users
                  </Button>
                  <Button color="inherit" component={Link} to="/faculty">
                    Faculty
                  </Button>
                  <Button color="inherit" component={Link} to="/department">
                    Department
                  </Button>
                </>
              )}

              {/* ปุ่ม About จะแสดงเมื่อ roles_id เป็น 1 หรือ 2 */}
              {(user?.roles_id === 1 || user?.roles_id === 3) && (
                <Button color="inherit" component={Link} to="/about">
                  About
                </Button>
              )}
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
