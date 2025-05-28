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
import { Navigate, useNavigate } from "react-router-dom"; // นำเข้า useNavigate

interface User {
  users_id: number;
  username: string;
  password: string;
  roles_id: number; // `roles_id` ควรเป็น number
  roles_name: string;
}

interface Facultys {
  faculty_id: number;
  faculty_name: string;
}

const Faculty: React.FC = () => {
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

  const [facultyData, setFacultyData] = useState<Facultys[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [redirectToLogin, setRedirectToLogin] = useState<boolean>(false);
  const [userLocalStorage, setUserLocalStorage] = useState<User | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [adding, setAdding] = useState<boolean>(false);
  const [loggingOut, setLoggingOut] = useState<boolean>(false); // ✅ เพิ่ม
  const [facultyName, setFacultyName] = useState<string>("");
  const [facultyID, setFacultyID] = useState<number | null>(null); // for editing
  const [openDialogAdd, setOpenDialogAdd] = useState<boolean>(false);
  const [openDialogEdit, setOpenDialogEdit] = useState<boolean>(false);
  const [openDialogDelete, setOpenDialogDelete] = useState<boolean>(false);

  const [countFaculty, setCountFaculty] = useState<number>(0);
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
              `http://localhost:3001/faculty/data?page=${page}&limit=${limit}`,
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
                setFacultyData(response.data.facultyData);
                setCountFaculty(response.data.countFaculty);
                setTotalPages(Math.ceil(response.data.countFaculty / limit));
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

  const handleAddFaculty = async () => {
    setAdding(true);
    try {
      const response = await axios.post(
        "http://localhost:3001/faculty/addNameFaculty",
        { faculty_name: facultyName },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setMessage("เพิ่มชื่อคณะสำเร็จ !");
        setTimeout(() => {
          setMessage("");
          setOpenDialogAdd(false);
          setFacultyName("");
          setFacultyData((prev) => [
            ...prev,
            { faculty_id: prev.length + 1, faculty_name: facultyName },
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

  const handleEditFaculty = async () => {
    if (facultyID !== null) {
      setAdding(true);
      try {
        const response = await axios.put(
          `http://localhost:3001/faculty/editNameFaculty/${facultyID}`,
          { faculty_name: facultyName },
          { withCredentials: true }
        );

        if (response.status === 200) {
          setMessage("แก้ไขชื่อคณะสำเร็จ !");
          setTimeout(() => {
            setMessage("");
            setOpenDialogEdit(false);
            setFacultyName("");
            setFacultyData((prev) =>
              prev.map((faculty) =>
                faculty.faculty_id === facultyID
                  ? { ...faculty, faculty_name: facultyName }
                  : faculty
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

  const handleDeleteFaculty = async () => {
    if (facultyID !== null) {
      setAdding(true);
      try {
        const response = await axios.delete(
          `http://localhost:3001/faculty/deleteFaculty/${facultyID}`,
          { withCredentials: true }
        );

        if (response.status === 200) {
          setMessage("ลบชื่อคณะสำเร็จ !");
          setTimeout(() => {
            setMessage("");
            setOpenDialogDelete(false); // ปิด Dialog เมื่อการลบเสร็จสิ้น
            setFacultyData((prev) =>
              prev.filter((faculty) => faculty.faculty_id !== facultyID)
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
    setFacultyName("");
    setMessage("");
  };

  const handleOpenDialogAdd = () => {
    setOpenDialogAdd(true);
  };

  const handleOpenDialogEdit = (faculty_id: number, faculty_name: string) => {
    setFacultyID(faculty_id);
    setFacultyName(faculty_name);
    setOpenDialogEdit(true);
  };

  const handleOpenDialogDelete = (faculty_id: number, faculty_name: string) => {
    setFacultyID(faculty_id);
    setFacultyName(faculty_name);
    setOpenDialogDelete(true);
  };

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
          เพิ่มชื่อคณะ
        </Button>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Faculty Name</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {facultyData.map((faculty, index) => (
              <TableRow key={index}>
                <TableCell>{faculty.faculty_id}</TableCell>
                <TableCell>{faculty.faculty_name}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() =>
                      handleOpenDialogEdit(
                        faculty.faculty_id,
                        faculty.faculty_name
                      )
                    }
                    sx={{ mr: 1 }} // เพิ่มระยะห่างเล็กน้อยจากปุ่ม "ลบ"
                  >
                    แก้ไข
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() =>
                      handleOpenDialogDelete(
                        faculty.faculty_id,
                        faculty.faculty_name
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
          จำนวนคณะทั้งหมด: {countFaculty}
        </Typography>
      </Box>

      {/* Dialog for adding faculty */}
      <Dialog open={openDialogAdd} onClose={handleCloseDialog}>
        <DialogTitle>เพิ่มชื่อคณะ</DialogTitle>
        <DialogContent>
          <TextField
            label="Faculty Name"
            fullWidth
            value={facultyName}
            onChange={(e) => setFacultyName(e.target.value)}
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
          <Button onClick={handleAddFaculty} color="primary">
            เพิ่ม
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for editing faculty */}
      <Dialog open={openDialogEdit} onClose={handleCloseDialog}>
        <DialogTitle>แก้ไขชื่อคณะ</DialogTitle>
        <DialogContent>
          <TextField
            label="Faculty Name"
            fullWidth
            value={facultyName}
            onChange={(e) => setFacultyName(e.target.value)}
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
          <Button onClick={handleEditFaculty} color="primary">
            แก้ไข
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for deleting faculty */}
      <Dialog open={openDialogDelete} onClose={handleCloseDialog}>
        <DialogTitle>ลบชื่อคณะ</DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {facultyID}. {facultyName}
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
          <Button onClick={handleDeleteFaculty} color="primary">
            ลบ
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Faculty;
