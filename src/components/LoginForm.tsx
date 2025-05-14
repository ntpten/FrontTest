import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Box,
  Typography,
  Container,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null); // Track user state

  const navigate = useNavigate();

  // ใช้ useEffect เพื่อเปลี่ยนเส้นทางหลังจาก user ถูกตั้งค่าเสร็จ
  useEffect(() => {
    if (user) {
      console.log("Login successful, navigating to /");
      navigate("/"); // เปลี่ยนเส้นทางไปยังหน้า Home
    }
  }, [user, navigate]); // เมื่อ user ถูกตั้งค่า, ใช้ useEffect เพื่อไปยังหน้า Home

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(""); // เคลียร์ error เดิม

    try {
      console.log("Attempting login with username:", username);
      const response = await axios.post(
        "http://localhost:3001/login",
        { username, password },
        { withCredentials: true } // แน่ใจว่า credentials ถูกส่งไป
      );

      console.log("Response from server:", response); // Log ข้อมูลที่ได้รับจาก server

      if (response.status === 200 && response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setUser(response.data.user); // Set user state after login
        setMessage(response.data.message);

        console.log("Login successful, navigating to /");

        // ทำการเปลี่ยนเส้นทางทันทีหลังจากที่ setUser ถูกตั้งค่า
        navigate("/"); // เปลี่ยนเส้นทางไปยังหน้า Home
        setTimeout(() => {
          window.location.reload(); // รีเฟรชหน้า Home
          console.log("setTimeout response.data.user :", response.data.user); // Set user state after login
          console.log(
            "setTimeout response.data.message :",
            response.data.message
          ); // Set user state after login
        }, 1000); // หน่วงเวลา 3 วินาที
      } else {
        setUser(response.data.user); // Set user state after login
        setMessage(response.data.message);

        console.log("Login successful, navigating to /login");
      }
    } catch (error: any) {
      console.error("Error during login attempt:", error);

      if (error.response?.status === 429) {
        // หากถูกจำกัดการเข้าสู่ระบบ (rate limited)
        setError("คุณเข้าสู่ระบบเกิน 5 ครั้ง กรุณาลองอีกครั้งใน 5 นาที");
      } else {
        setError(
          error.response?.data?.message || "Invalid username or password"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 8,
        }}
      >
        <Typography component="h1" variant="h5">
          Please log in
        </Typography>

        {message && (
          <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}

        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        {loading ? (
          <Box sx={{ mt: 4 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>กำลังเข้าสู่ระบบ...</Typography>
          </Box>
        ) : (
          <form onSubmit={handleLogin} noValidate>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              label="Username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Login
            </Button>
          </form>
        )}
      </Box>
    </Container>
  );
};

export default LoginForm;
