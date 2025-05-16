import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
} from "@mui/material";
import { Navigate, useNavigate } from "react-router-dom"; // นำเข้า useNavigate
import axios from "axios";

const Home = () => {
  const [message, setMessage] = useState<string>("");
  const [activities, setActivities] = useState<any[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loggingOut, setLoggingOut] = useState<boolean>(false); // ✅ เพิ่ม
  const navigate = useNavigate(); // ใช้ useNavigate เพื่อใช้ฟังก์ชัน navigate

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setMessage("Welcome back!");

        const fetchData = async () => {
          try {
            // รอให้ข้อมูลจาก backend มาเสร็จสมบูรณ์ก่อนแสดง
            const response = await axios.get("http://localhost:3001/", {
              withCredentials: true,
            });

            if (response.data.activities) {
              setActivities(response.data.activities);
            }
            setLoading(false); // ตั้งให้โหลดเสร็จเมื่อได้ข้อมูลจาก backend
          } catch (error) {
            console.error("Error fetching activities:", error);
            setLoading(false); // หยุดการโหลดหากมีข้อผิดพลาด
            navigate("/login"); // หากเกิดข้อผิดพลาด, เปลี่ยนเส้นทางไปที่ login
          }
        };

        fetchData(); // เรียกใช้ fetchData ใน useEffect
      } catch (error) {
        console.error("Error parsing user data from localStorage", error);
        localStorage.removeItem("user");
        setUser(null);
        setMessage("Please log in");
        setLoading(false); // ปิดสถานะ loading
        navigate("/login"); // หากเกิดข้อผิดพลาด, เปลี่ยนเส้นทางไปที่ login
      }
    } else {
      setUser(null);
      setMessage("Please log in");
      setLoading(false); // ปิดสถานะ loading หากไม่พบข้อมูลผู้ใช้
      navigate("/login"); // หากไม่มีข้อมูลผู้ใช้, เปลี่ยนเส้นทางไปที่ login
    }
  }, [navigate]); // เพิ่ม `navigate` เป็น dependency ของ useEffect

  // 🔃 แสดงระหว่างกำลัง logout
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

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography variant="h5">Loading...</Typography>
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" />; // หากไม่มี user ให้ redirect ไปที่ login
  }

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
        navigate("/login"); // ไปที่หน้า login
      }, 3000); // หน่วงเวลา 3 วินาทีเพื่อให้การ logout เสร็จสมบูรณ์
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false); // หยุดโหลดหาก error
      navigate("/login"); // หาก logout ไม่สำเร็จ ให้ redirect ไปที่ login
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          {message}
        </Typography>

        <Button onClick={handleLogout} color="primary" variant="contained">
          Logout
        </Button>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "center",
            mt: 4,
          }}
        >
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <Card key={index} sx={{ width: 300 }}>
                <CardContent>
                  <Typography variant="h6">{activity.title}</Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {activity.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Date: {activity.date}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">
                    Register
                  </Button>
                </CardActions>
              </Card>
            ))
          ) : (
            <Typography variant="body1" color="text.secondary">
              No activities available at the moment.
            </Typography>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default Home;
