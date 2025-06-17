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

interface Teacher {
  teacher_id: number;
  username: string;
  roles_name: string;
  first_name: string;
  last_name: string;
  faculty_id: number;
}

interface Facultys {
  faculty_id: number;
  faculty_name: string;
}

const TeachersData: React.FC = () => {
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

  const [teachersData, setTeacherData] = useState<Teacher[]>([]);
  const [facultyData, setFacultyData] = useState<Facultys[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [userLocalStorage, setUserLocalStorage] = useState<User | null>(null);

  const [message, setMessage] = useState<string>("");

  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [countTeacher, setCountTeacher] = useState<number>(0);

  const [teacherID, setTeacherID] = useState<number | null>(null);
  const [usersID, setUsersID] = useState<number | null>(null);
  const [username, setUsername] = useState<string>("");
  const [roles, setRoles] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [facultyID, setFacultyID] = useState<number | null>(null);

  const [notification, setNotification] = useState<string>("");
  const [loggingOut, setLoggingOut] = useState<boolean>(false); // ✅ เพิ่ม
  const [adding, setAdding] = useState<boolean>(false);

  const [openDialogAdd, setOpenDialogAdd] = useState<boolean>(false);
  const [openDialogEdit, setOpenDialogEdit] = useState<boolean>(false);
  const [openDialogDelete, setOpenDialogDelete] = useState<boolean>(false);

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
              `http://localhost:3001/teacher/data?page=${page}&limit=${limit}`,
              { withCredentials: true }
            );

            if (response.status === 200) {
              if (response.data.user === null) {
                // setRedirectToLogin(true);
                handleLogout();
              } else {
                setPage(response.data.page);
                setTeacherData(response.data.teacherData);
                setCountTeacher(response.data.countTeacher);
                setTotalPages(Math.ceil(response.data.countTeacher / limit));
                setFacultyData(response.data.facultyData);
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
    setFirstName("");
    setLastName("");
    setMessage("");
  };

  const handleOpenDialogEdit = (
    teacher_id: number,
    username: string,
    roles_name: string,
    first_name: string,
    last_name: string,
    faculty_id: number
  ) => {
    setTeacherID(teacher_id);
    setUsername(username);
    setRoles(roles_name);
    setFirstName(first_name);
    setLastName(last_name);
    setFacultyID(faculty_id);
    setOpenDialogEdit(true);
  };

  const handleEditTeacher = async (teacherID: number) => {
    setAdding(true);
    const requestData = {
      first_name: firstName && firstName.trim() ? firstName.trim() : null,
      last_name: lastName && lastName.trim() ? lastName.trim() : null,
      faculty_id: facultyID ?? null,
    };

    try {
      const response = await axios.put(
        `http://localhost:3001/teacher/edit/${teacherID}`,
        requestData,
        { withCredentials: true }
      );

      if (response.status === 201) {
        setMessage("แก้ไขข้อมูลอาจารย์สำเร็จ!");
        setTeacherData((prev) =>
          prev.map((teacher) =>
            teacher.teacher_id === teacherID
              ? {
                  ...teacher,
                  teacher_id: teacherID,
                  first_name: firstName || teacher.first_name,
                  last_name: lastName || teacher.last_name,
                  faculty_id: facultyID ?? teacher.faculty_id,
                }
              : teacher
          )
        );
        setTimeout(() => {
          setMessage("");
          setOpenDialogEdit(false);
          setAdding(false);
        }, 2000);
      } else {
        setMessage(response.data.message);
        setAdding(false);
      }
    } catch (error: any) {
      setMessage("เกิดข้อผิดพลาดในการแก้ไขข้อมูลนิสิต");
      setAdding(false);
    }
  };

  const handleOpenDialogDelete = (teacher_id: number, username: string) => {
    setTeacherID(teacher_id);
    setUsername(username);
    setOpenDialogDelete(true);
  };

  const handleDeleteUsers = async (teacherID: number) => {
    setAdding(true);

    try {
      // ส่งคำขอ DELETE ไปที่ API
      const response = await axios.delete(
        `http://localhost:3001/teacher/delete/${teacherID}`,
        { withCredentials: true }
      );

      if (response.status === 201) {
        // ใช้ 200 แทน 201 สำหรับการลบ
        setMessage("ลบผู้ใช้สำเร็จ !");
        setOpenDialogDelete(false);

        // อัปเดตข้อมูลผู้ใช้ใน UI
        setTeacherData((prev) =>
          prev.filter((teacher) => teacher.teacher_id !== teacherID)
        );
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
  const handleTeacher = () => {
    navigate("/teacher");
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          {page}
        </Typography>
        <Button onClick={handleTeacher} color="primary" variant="contained">
          อาจารย์ที่ลงทะเบียนสำเร็จแล้ว
        </Button>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>เลขอาจารย์</TableCell>
              <TableCell>ประเภท</TableCell>
              <TableCell>ชื่อ</TableCell>
              <TableCell>นามสกุล</TableCell>
              <TableCell>คณะ</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teachersData.map((teacher, index) => (
              <TableRow key={index}>
                <TableCell>{teacher.teacher_id}</TableCell>
                <TableCell>{teacher.username}</TableCell>
                <TableCell>{teacher.roles_name}</TableCell>
                <TableCell>{teacher.first_name}</TableCell>
                <TableCell>{teacher.last_name}</TableCell>
                <TableCell>{teacher.faculty_id}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() =>
                      handleOpenDialogEdit(
                        teacher.teacher_id,
                        teacher.username,
                        teacher.roles_name,
                        teacher.first_name,
                        teacher.last_name,
                        teacher.faculty_id
                      )
                    }
                    sx={{ mr: 1 }}
                  >
                    แก้ไข
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() =>
                      handleOpenDialogDelete(
                        teacher.teacher_id,
                        teacher.username
                      )
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
          จำนวนอาจารย์ทั้งหมด: {countTeacher}
        </Typography>
      </Box>

      {/* Dialog for editing user */}
      <Dialog open={openDialogEdit} onClose={handleCloseDialog}>
        <DialogTitle>แก้ไขข้อมูลผู้ใช้</DialogTitle>
        <DialogContent>
          <TextField
            label="Teacher ID"
            fullWidth
            value={teacherID}
            disabled
            sx={{ mb: 2 }}
          />

          <TextField
            label="Username"
            fullWidth
            value={username}
            disabled
            sx={{ mb: 2 }}
          />

          <TextField
            label="Roles"
            fullWidth
            value={roles}
            disabled
            sx={{ mb: 2 }}
          />
          <TextField
            label="FirstName"
            fullWidth
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="LastName"
            fullWidth
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            label="เลือก Faculty"
            fullWidth
            value={facultyID || ""}
            onChange={(e) => setFacultyID(parseInt(e.target.value))}
            sx={{ mb: 2 }}
          >
            {/* MenuItem สำหรับ default ค่า "ยังไม่มีค่า" */}
            <MenuItem value="">ยังไม่มีค่า</MenuItem>

            {/* รายการ faculty ที่มีอยู่ */}
            {facultyData.map((faculty) => (
              <MenuItem key={faculty.faculty_id} value={faculty.faculty_id}>
                {faculty.faculty_name}
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
              if (teacherID && teacherID !== null) {
                handleEditTeacher(teacherID);
              } else {
                setMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
              }
            }}
          >
            แก้ไข
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialogDelete} onClose={handleCloseDialog}>
        <DialogTitle>ลบผู้ใช้</DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {teacherID}. {username}
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
              if (teacherID) {
                // ตรวจสอบว่า userID มีค่าหรือไม่ก่อนทำการลบ
                handleDeleteUsers(teacherID); // ส่ง userID ไปลบ
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

export default TeachersData;
