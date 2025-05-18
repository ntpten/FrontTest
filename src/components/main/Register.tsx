// D:\Front Test\front\src\components\main\Register.tsx
import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // นำเข้า axios

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState(""); // State สำหรับข้อความจาก backend
  const [isLoading, setIsLoading] = useState(false); // State สำหรับการแสดง loading spinner
  const navigate = useNavigate();

  // เรียกข้อมูลจาก /register GET เพื่อแสดงข้อความ
  useEffect(() => {
    axios
      .get("http://localhost:3001/register")
      .then((response) => setMessage(response.data.message)) // เก็บข้อความจาก backend ลงใน state
      .catch((error) => console.error("Error fetching register page:", error));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!username || !password) {
      setErrorMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      setIsLoading(true); // เริ่มแสดง Loading Spinner

      const response = await axios.post("http://localhost:3001/register", {
        username,
        password,
      });

      if (response.status === 200) {
        setMessage("ลงทะเบียนสำเร็จ! กำลังเปลี่ยนไปยังหน้าล็อกอิน...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error: any) {
      if (error.response) {
        // ❗ ถ้า backend ส่งข้อความมา
        setErrorMessage(error.response.data?.message || "เกิดข้อผิดพลาด");
      } else {
        // ❗ ถ้าไม่มีการตอบกลับจาก backend (เช่น server ล่ม)
        setErrorMessage("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      }
    } finally {
      setIsLoading(false); // หยุดแสดง Loading Spinner
    }
  };

  return (
    <Box sx={{ width: 300, margin: "auto", paddingTop: 5 }}>
      {/* แสดงข้อความจาก backend ก่อนฟอร์ม */}
      {message && (
        <Typography variant="h6" gutterBottom>
          {message}
        </Typography>
      )}

      <Typography variant="h5" gutterBottom>
        ลงทะเบียน
      </Typography>
      {errorMessage && (
        <Typography color="error" variant="body2" paragraph>
          {errorMessage}
        </Typography>
      )}

      {/* แสดงวงกลมหมุน (loading spinner) ขณะที่ลงทะเบียนกำลังดำเนินการ */}
      {isLoading ? (
        <CircularProgress sx={{ display: "block", margin: "auto" }} />
      ) : (
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            margin="normal"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: 2 }}
          >
            ลงทะเบียน
          </Button>
        </form>
      )}
    </Box>
  );
};

export default Register;
