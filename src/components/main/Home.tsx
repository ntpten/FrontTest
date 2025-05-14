import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress, // ✅ เพิ่ม
} from "@mui/material";
import { Navigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const [message, setMessage] = useState<string>("");
  const [activities, setActivities] = useState<any[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loggingOut, setLoggingOut] = useState<boolean>(false); // ✅ เพิ่ม

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setMessage("Welcome back!");

        axios
          .get("http://localhost:3001/", { withCredentials: true })
          .then((response) => {
            if (response.data.activities) {
              setActivities(response.data.activities);
            }
          })
          .catch((error) => console.error("Error fetching activities:", error));
      } catch (error) {
        console.error("Error parsing user data from localStorage", error);
        localStorage.removeItem("user");
        setUser(null);
        setMessage("Please log in");
      }
    } else {
      setUser(null);
      setMessage("Please log in");
    }

    setLoading(false);
  }, []);

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
    return <Navigate to="/login" />;
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
        window.location.href = "/login"; // ไปที่หน้า login

        // รอ 3 วินาทีแล้วทำการรีเฟรชหน้า /login
        setTimeout(() => {
          window.location.reload(); // รีเฟรชหน้า
        }, 3000); // รอ 3 วินาทีหลังจากไปที่หน้า /login
      }, 3000); // ลดเวลาเป็น 2 วินาที เพื่อให้การ logout เสร็จสมบูรณ์
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false); // หยุดโหลดหาก error
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
