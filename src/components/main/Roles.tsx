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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import axios, { AxiosError } from "axios";
import { Navigate, useNavigate } from "react-router-dom"; 

interface User {
  users_id: number;
  username: string;
  password: string;
  roles_id: number; // `roles_id` ควรเป็น number
  roles_name: string;
}

interface Roles {
  roles_id: number;
  roles_name: string;
}

const Role: React.FC = () => {
  const handleLogout = async () => {
    setLoggingOut(true); // เริ่มแสดง loading
    try {
      await axios.get("http://localhost:3001/logout", {
        withCredentials: true,
      });
      localStorage.removeItem("user");
      setUserLocalStorage(null);

      // หน่วงเวลาให้การ logout เสร็จสมบูรณ์ก่อน
      setTimeout(() => {
        navigate("/login");

        // รอ 1 วินาทีหลังจากไปที่หน้า /login
        setTimeout(() => {
          window.location.reload(); // รีเฟรชหน้า
          setLoggingOut(false); // รีเซ็ตสถานะการล็อกเอาท์เป็น false หลังจากรีเฟรชหน้าแล้ว
        }, 1000); // รอ 1 วินาทีหลังจากไปที่หน้า /login
      }, 3000); // ลดเวลาเป็น 3 วินาที เพื่อให้การ logout เสร็จสมบูรณ์
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
      navigate("/login");
    }
  };

  const [rolesData, setRolesData] = useState<Roles[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [userLocalStorage, setUserLocalStorage] = useState<User | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [adding, setAdding] = useState<boolean>(false);
  const [loggingOut, setLoggingOut] = useState<boolean>(false); // ✅ เพิ่ม
  const [rolesName, setRolesName] = useState<string>("");
  const [rolesID, setRolesID] = useState<number | null>(null); // for editing
  const [openDialogAdd, setOpenDialogAdd] = useState<boolean>(false);
  const [openDialogEdit, setOpenDialogEdit] = useState<boolean>(false);
  const [openDialogDelete, setOpenDialogDelete] = useState<boolean>(false);

  const [countRoles, setCountRoles] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);

  const navigate = useNavigate(); // ใช้ useNavigate เพื่อใช้ฟังก์ชัน navigate

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserLocalStorage(parsedUser);

        const fetchData = async () => {
          try {
            const response = await axios.get(
              `http://localhost:3001/roles/data?page=${page}&limit=${limit}`,
              {
                withCredentials: true,
              }
            );

            if (response.status === 200) {
              if (response.data.user === null) {
                // setRedirectToLogin(true);
                handleLogout();
              } else {
                setPage(response.data.page);
                setRolesData(response.data.rolesData);
                setCountRoles(response.data.countRoles);
                setTotalPages(Math.ceil(response.data.countRoles / limit));
                setNotification(response.data.notification);
                setLoading(false);
              }
            } else {
              handleLogout();
            }
          } catch (error: any) {
            console.error("Error fetching Users Information:", error);
            setError(
              error.response?.data?.notification ||
                "Error fetching Users Information"
            );
            navigate("/unauthorized");

            setLoading(false);
            handleLogout();
            // ตรวจสอบข้อผิดพลาดเป็น AxiosError
            if ((error as AxiosError).response?.status === 401) {
              navigate("/unauthorized");
              setLoading(false);
              handleLogout();
            }
          }
        };

        fetchData();
      } catch (error) {
        console.error("Error parsing user data from localStorage", error);
        localStorage.removeItem("user");
        setUserLocalStorage(null);
        setNotification("Please log in");
        setLoading(false);
      }
    } else {
      setUserLocalStorage(null);
      setNotification("Please log in");
      setLoading(false);
    }
  }, [page, limit]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleAddRoles = async () => {
    setAdding(true);
    try {
      const response = await axios.post(
        "http://localhost:3001/roles/add",
        { roles_name: rolesName },
        { withCredentials: true }
      );

      if (response.status === 201) {
        setMessage("เพิ่มชื่อบทบาทสำเร็จ !");
        setTimeout(() => {
          setMessage("");
          setOpenDialogAdd(false);
          setRolesName("");
          setRolesData((prev) => [
            ...prev,
            { roles_id: prev.length + 1, roles_name: rolesName },
          ]);
          setAdding(false);
        }, 2000);
      } else {
        setMessage(response.data.message);
        setAdding(false);
      }
    } catch (error: any) {
      setMessage("เกิดข้อผิดพลาด");
      setAdding(false);
    }
  };

  const handleEditRoles = async () => {
    if (rolesID !== null) {
      setAdding(true);
      try {
        const response = await axios.put(
          `http://localhost:3001/roles/edit/${rolesID}`,
          { roles_name: rolesName },
          { withCredentials: true }
        );

        if (response.status === 201) {
          setMessage("แก้ไขชื่อบทบาทสำเร็จ !");
          setTimeout(() => {
            setMessage("");
            setOpenDialogEdit(false);
            setRolesName("");
            setRolesData((prev) =>
              prev.map((roles) =>
                roles.roles_id === rolesID
                  ? { ...roles, roles_name: rolesName }
                  : roles
              )
            );
            setAdding(false);
          }, 2000);
        } else {
          setMessage(response.data.message);
        }
      } catch (error: any) {
        setMessage("เกิดข้อผิดพลาด");
        setAdding(false);
      }
    }
  };

  const handleDeleteRoles = async () => {
    if (rolesID !== null) {
      setAdding(true);
      try {
        const response = await axios.delete(
          `http://localhost:3001/roles/delete/${rolesID}`,
          { withCredentials: true }
        );

        if (response.status === 201) {
          setMessage("ลบชื่อบทบาทสำเร็จ !");
          setTimeout(() => {
            setMessage("");
            setOpenDialogDelete(false); // ปิด Dialog เมื่อการลบเสร็จสิ้น
            setRolesData((prev) =>
              prev.filter((roles) => roles.roles_id !== rolesID)
            );
            setAdding(false);
          }, 2000);
        } else {
          setMessage(response.data.message);
          setAdding(false);
        }
      } catch (error: any) {
        setMessage("เกิดข้อผิดพลาดในการลบ");
        setAdding(false);
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialogAdd(false);
    setOpenDialogEdit(false);
    setOpenDialogDelete(false);
    setRolesName("");
    setMessage("");
  };

  const handleOpenDialogAdd = () => {
    setOpenDialogAdd(true);
  };

  const handleOpenDialogEdit = (roles_id: number, roles_name: string) => {
    setRolesID(roles_id);
    setRolesName(roles_name);
    setOpenDialogEdit(true);
  };

  const handleOpenDialogDelete = (roles_id: number, roles_name: string) => {
    setRolesID(roles_id);
    setRolesName(roles_name);
    setOpenDialogDelete(true);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column", // จัดเรียงเป็นคอลัมน์
        }}
      >
        <CircularProgress sx={{ mb: 2 }} /> {/* เพิ่ม margin ด้านล่าง */}
        <Typography variant="h5">กำลังตรวจสอบสิทธิ์การใช้งาน...</Typography>
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

  if (!userLocalStorage) {
    return <Navigate to="/login" />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          {page}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenDialogAdd}
        >
          เพิ่มชื่อบทบาท
        </Button>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Roles Name</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rolesData.map((roles, index) => (
              <TableRow key={index}>
                <TableCell>{roles.roles_id}</TableCell>
                <TableCell>{roles.roles_name}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() =>
                      handleOpenDialogEdit(roles.roles_id, roles.roles_name)
                    }
                    sx={{ mr: 1 }} // เพิ่มระยะห่างเล็กน้อยจากปุ่ม "ลบ"
                  >
                    แก้ไข
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() =>
                      handleOpenDialogDelete(roles.roles_id, roles.roles_name)
                    }
                  >
                    ลบ
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)} // ลด page ไป 1 หน้า
          >
            Previous
          </Button>
          <Typography sx={{ mx: 2 }}>
            Page {page} of {totalPages} {/* แสดงเลขหน้า */}
          </Typography>
          <Button
            disabled={page === totalPages}
            onClick={() => handlePageChange(page + 1)} // เพิ่ม page ไป 1 หน้า
          >
            Next
          </Button>
        </Box>
        <Typography
          variant="h6"
          sx={{ display: "flex", justifyContent: "center", mt: 2 }}
        >
          จำนวนชื่อบทบาททั้งหมด: {countRoles}
        </Typography>
      </Box>

      {/* Dialog for adding roles */}
      <Dialog open={openDialogAdd} onClose={handleCloseDialog}>
        <DialogTitle>เพิ่มชื่อบทบาท</DialogTitle>
        <DialogContent>
          <TextField
            label="Roles Name"
            fullWidth
            value={rolesName}
            onChange={(e) => setRolesName(e.target.value)}
            sx={{ mb: 2 }}
          />
          {message && <Typography color="error">{message}</Typography>}
          {adding && (
            <CircularProgress
              size={24}
              sx={{ display: "block", margin: "10px auto" }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            ยกเลิก
          </Button>
          <Button onClick={handleAddRoles} color="primary">
            เพิ่ม
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for editing faculty */}
      <Dialog open={openDialogEdit} onClose={handleCloseDialog}>
        <DialogTitle>แก้ไขชื่อบทบาท</DialogTitle>
        <DialogContent>
          <TextField
            label="Roles Name"
            fullWidth
            value={rolesName}
            onChange={(e) => setRolesName(e.target.value)}
            sx={{ mb: 2 }}
          />
          {message && <Typography color="error">{message}</Typography>}
          {adding && (
            <CircularProgress
              size={24}
              sx={{ display: "block", margin: "10px auto" }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            ยกเลิก
          </Button>
          <Button onClick={handleEditRoles} color="primary">
            แก้ไข
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for deleting roles */}
      <Dialog open={openDialogDelete} onClose={handleCloseDialog}>
        <DialogTitle>ลบชื่อบทบาท</DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {rolesID}. {rolesName}
          </Typography>

          {message && <Typography color="error">{message}</Typography>}
          {adding && (
            <CircularProgress
              size={24}
              sx={{ display: "block", margin: "10px auto" }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            ยกเลิก
          </Button>
          <Button onClick={handleDeleteRoles} color="primary">
            ลบ
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Role;
