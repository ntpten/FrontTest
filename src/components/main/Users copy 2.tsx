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
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  MenuItem,
} from "@mui/material";
import axios, { AxiosError } from "axios";
import { Navigate, useNavigate } from "react-router-dom"; // นำเข้า useNavigate

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

const Users: React.FC = () => {
  // ประกาศฟังก์ชัน handleLogout ที่นี่
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
        window.location.href = "/login"; // ไปที่หน้า login

        // รอ 3 วินาทีแล้วทำการรีเฟรชหน้า /login
        setTimeout(() => {
          window.location.reload(); // รีเฟรชหน้า
        }, 1000); // รอ 3 วินาทีหลังจากไปที่หน้า /login
      }, 5000); // ลดเวลาเป็น 2 วินาที เพื่อให้การ logout เสร็จสมบูรณ์
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false); // หยุดโหลดหาก error
    }
  };

  const [usersData, setUsersData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [userLocalStorage, setUserLocalStorage] = useState<User | null>(null);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rolesID, setRolesID] = useState<number | null>(null);
  const [rolesData, setRolesData] = useState<Roles[]>([]);
  const [usersID, setUsersID] = useState<number>(0);
  const [user, setUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [message, setMessage] = useState<string>("");

  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [countUsers, setCountUsers] = useState<number>(0);

  const [notification, setNotification] = useState<string>("");
  const [loggingOut, setLoggingOut] = useState<boolean>(false); // ✅ เพิ่ม
  const [adding, setAdding] = useState<boolean>(false);

  const [openDialogAdd, setOpenDialogAdd] = useState<boolean>(false);
  const [openDialogEdit, setOpenDialogEdit] = useState<boolean>(false);
  const [openDialogDelete, setOpenDialogDelete] = useState<boolean>(false);
  const [openDialogChangePassword, setOpenDialogChangePassword] =
    useState<boolean>(false);

  const [initialUsername, setInitialUsername] = useState<string>(""); // ประกาศตัวแปร initialUsername

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
              `http://localhost:3001/users?page=${page}&limit=${limit}`,
              { withCredentials: true }
            );

            if (response.status === 200) {
              if (response.data.user === null) {
                // setRedirectToLogin(true);
                handleLogout();
              } else {
                setPage(response.data.page);
                setUsersData(response.data.usersData);
                setCountUsers(response.data.countUsers);
                setTotalPages(Math.ceil(response.data.countUsers / limit));
                setRolesData(response.data.roles);
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

            // ตรวจสอบข้อผิดพลาดเป็น AxiosError
            if ((error as AxiosError).response?.status === 401) {
              navigate("/unauthorized");
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

  const handleCloseDialog = () => {
    setOpenDialogAdd(false);
    setOpenDialogEdit(false);
    setOpenDialogDelete(false);
    setUsername("");
    setMessage("");
  };

  const handleOpenDialogAdd = () => {
    setUsername("");
    setPassword("");
    setRolesID(null);
    setOpenDialogAdd(true);
  };

  const handleAddUsers = async () => {
    setAdding(true);
    if (rolesID === null) {
      setMessage(message || "กรุณาเลือก Roles");
      setAdding(false);
      return;
    }

    if (!username || !password) {
      setMessage(message || "กรุณากรอกข้อมูลผู้ใช้และรหัสผ่าน");
      setAdding(false);
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:3001/addUsers",
        { username, password, roles_id: rolesID },
        { withCredentials: true }
      );

      if (response.status === 201) {
        setMessage(response.data.message || "เพิ่มผู้ใช้สำเร็จ !");
        setUsersData((prev) => [
          ...prev,
          {
            users_id: prev.length + 1,
            username: username,
            password: password,
            roles_id: rolesID,
            roles_name:
              rolesData.find((role) => role.roles_id === rolesID)?.roles_name ||
              "",
          },
        ]);
        setTimeout(() => {
          setMessage("");
          setOpenDialogAdd(false);
          setUsername("");
          setPassword("");
          setRolesID(null);
          setAdding(false);
        }, 2000);
      } else {
        setMessage(response.data.message);
        setAdding(false);
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || "เกิดข้อผิดพลาด");
      setAdding(false);
    }
  };

  const handleOpenDialogEdit = (
    user_id: number,
    username: string,
    roles_id: number
  ) => {
    setUsersID(user_id);
    setUsername(username);
    setInitialUsername(username); // เก็บค่า initialUsername
    setRolesID(roles_id);
    setOpenDialogEdit(true);
  };

  const handleEditUsers = async (userID: number) => {
    setAdding(true);
    // ตรวจสอบค่าของ username และ rolesID
    if (!username.trim() || rolesID === null) {
      setMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
      setAdding(false);
      return;
    }

    try {
      // ปรับประเภทของ requestData ให้รองรับ username และ roles_id
      let requestData: { username?: string; roles_id: number } = {
        roles_id: rolesID,
      };

      // ตรวจสอบว่า username ถูกเปลี่ยนแปลงหรือไม่
      if (username.trim() !== initialUsername) {
        requestData.username = username; // ถ้าเปลี่ยนแปลงให้ส่งค่า username ด้วย
      }

      const response = await axios.put(
        `http://localhost:3001/editUsers/${userID}`,
        requestData,
        { withCredentials: true }
      );

      if (response.status === 201) {
        setMessage("แก้ไขข้อมูลผู้ใช้สำเร็จ!");
        setUsersData((prev) =>
          prev.map((user) =>
            user.users_id === userID
              ? {
                  ...user,
                  username,
                  roles_id: rolesID,
                  roles_name:
                    rolesData.find((role) => role.roles_id === rolesID)
                      ?.roles_name || "",
                }
              : user
          )
        );
        setTimeout(() => {
          setMessage("");
          setOpenDialogEdit(false);
          setUsername(""); // รีเซ็ต username
          setRolesID(null); // รีเซ็ต rolesID
          setAdding(false);
        }, 2000);
      } else {
        setMessage(response.data.message);
        setAdding(false);
      }
    } catch (error: any) {
      setMessage("เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้");
      setAdding(false);
    }
  };

  const handleOpenDialogDelete = (user_id: number, username: string) => {
    setUsersID(user_id);
    setUsername(username);
    setOpenDialogDelete(true);
  };

  const handleDeleteUsers = async (userID: number) => {
    setAdding(true);

    try {
      // ส่งคำขอ DELETE ไปที่ API
      const response = await axios.delete(
        `http://localhost:3001/deleteUsers/${userID}`,
        { withCredentials: true }
      );

      // ตรวจสอบสถานะการตอบกลับ
      if (response.status === 201) {
        // ใช้ 200 แทน 201 สำหรับการลบ
        setMessage("ลบผู้ใช้สำเร็จ !");
        setOpenDialogDelete(false);

        // อัปเดตข้อมูลผู้ใช้ใน UI
        setUsersData((prev) => prev.filter((user) => user.users_id !== userID));
        setTimeout(() => {
          setMessage("");
          setAdding(false);
        }, 2000);
      } else {
        setMessage(response.data.message);
        setAdding(false);
      }
    } catch (error: any) {
      setMessage("เกิดข้อผิดพลาดในการลบผู้ใช้");
      setAdding(false);
    }
  };
  const handleOpenDialogChangePassword = (users_id: number) => {
    setUsersID(users_id);
    setOpenDialogChangePassword(true);
  };

  const handleChangePassword = async () => {
    setAdding(true);
    if (newPassword !== confirmPassword) {
      setMessage("รหัสผ่านไม่ตรงกัน");
      setAdding(false);
      return;
    }
    try {
      const response = await axios.put(
        `http://localhost:3001/editPasswordUsers/${usersID}`,
        { password: newPassword, confirmPassword: confirmPassword },
        { withCredentials: true }
      );
      if (response.status === 201) {
        setMessage("เปลี่ยนรหัสผ่านสำเร็จ !");
        setTimeout(() => {
          setMessage("");
          setOpenDialogChangePassword(false);
          setNewPassword("");
          setConfirmPassword("");
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
          เพิ่มผู้ใช้
        </Button>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usersData.map((user, index) => (
              <TableRow key={index}>
                <TableCell>{user.users_id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.roles_name}</TableCell>
                <TableCell>
                  {/* แก้ไข, ลบ, เปลี่ยนรหัสผ่าน */}
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() =>
                      handleOpenDialogEdit(
                        user.users_id,
                        user.username,
                        user.roles_id
                      )
                    }
                    sx={{ mr: 1 }}
                  >
                    แก้ไข
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() =>
                      handleOpenDialogChangePassword(user.users_id)
                    }
                  >
                    เปลี่ยนรหัสผ่าน
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() =>
                      handleOpenDialogDelete(user.users_id, user.username)
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
          จำนวนผู้ใช้ทั้งหมด: {countUsers}
        </Typography>
      </Box>

      {/* Dialogs */}
      {/* Dialog for adding user */}
      <Dialog open={openDialogAdd} onClose={handleCloseDialog}>
        <DialogTitle>เพิ่มผู้ใช้</DialogTitle>
        <DialogContent>
          <TextField
            label="Username"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            label="เลือก Role"
            fullWidth
            value={rolesID || ""}
            onChange={(e) => setRolesID(parseInt(e.target.value))}
            sx={{ mb: 2 }}
          >
            {rolesData.map((role) => (
              <MenuItem key={role.roles_id} value={role.roles_id}>
                {role.roles_name}
              </MenuItem>
            ))}
          </TextField>
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
          <Button onClick={handleAddUsers} color="primary">
            เพิ่ม
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for editing user */}
      <Dialog open={openDialogEdit} onClose={handleCloseDialog}>
        <DialogTitle>แก้ไขข้อมูลผู้ใช้</DialogTitle>
        <DialogContent>
          <TextField
            label="Username"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            label="เลือก Roles"
            fullWidth
            value={rolesID || ""}
            onChange={(e) => setRolesID(parseInt(e.target.value))}
            sx={{ mb: 2 }}
          >
            {rolesData.map((roles) => (
              <MenuItem key={roles.roles_id} value={roles.roles_id}>
                {roles.roles_name}
              </MenuItem>
            ))}
          </TextField>
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
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              if (usersID && username.trim() && rolesID !== null) {
                handleEditUsers(usersID);
              } else {
                setMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
              }
            }}
          >
            แก้ไข
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for editing password */}
      <Dialog open={openDialogChangePassword} onClose={handleCloseDialog}>
        <DialogTitle>เปลี่ยนรหัสผ่าน</DialogTitle>
        <DialogContent>
          <TextField
            label="รหัสผ่านใหม่"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="ยืนยันรหัสผ่านใหม่"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          <Button onClick={handleChangePassword} color="primary">
            เปลี่ยนรหัสผ่าน
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for deleting user */}
      <Dialog open={openDialogDelete} onClose={handleCloseDialog}>
        <DialogTitle>ลบผู้ใช้</DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {usersID}. {username}
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
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              if (usersID) {
                // ตรวจสอบว่า userID มีค่าหรือไม่ก่อนทำการลบ
                handleDeleteUsers(usersID); // ส่ง userID ไปลบ
              }
            }}
          >
            ลบ
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Users;
