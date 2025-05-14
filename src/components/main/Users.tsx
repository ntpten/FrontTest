import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";
import axios from "axios";
import { Navigate } from "react-router-dom"; // นำเข้า Navigate

const Users: React.FC = () => {
  const [usersData, setUsersData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [redirectToLogin, setRedirectToLogin] = useState<boolean>(false); // ใช้ state สำหรับการ redirect

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      setRedirectToLogin(true); // ถ้าไม่มีผู้ใช้ใน localStorage, set ค่า redirect
      return;
    }

    axios
      .get("http://localhost:3001/users", { withCredentials: true })
      .then((response) => {
        setUsersData(response.data.usersData);
        setLoading(false);
      })
      .catch((error) => {
        setError("Error fetching user data.");
        setLoading(false);
      });
  }, []);

  // ถ้า redirectToLogin เป็น true, ให้ redirect ไปที่ /login
  if (redirectToLogin) {
    return <Navigate to="/login" />;
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
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Users Information
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usersData.map((user, index) => (
              <TableRow key={index}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.roles_name}</TableCell>
                <TableCell>
                  <Button variant="outlined" color="primary">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Container>
  );
};

export default Users;
