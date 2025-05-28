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

interface Departments {
  department_id: number;
  department_name: string;
  faculty_id: number;
}

interface Facultys {
  faculty_id: number;
  faculty_name: string;
}

const Department: React.FC = () => {
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

  const [departmentData, setDepartmentData] = useState<Departments[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [redirectToLogin, setRedirectToLogin] = useState<boolean>(false);
  const [userLocalStorage, setUserLocalStorage] = useState<User | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [adding, setAdding] = useState<boolean>(false);
  const [loggingOut, setLoggingOut] = useState<boolean>(false); // ✅ เพิ่ม
  const [departmentName, setDepartmentName] = useState<string>("");
  const [departmentID, setDepartmentID] = useState<number | null>(null); // for editing
  const [openDialogAdd, setOpenDialogAdd] = useState<boolean>(false);
  const [openDialogEdit, setOpenDialogEdit] = useState<boolean>(false);
  const [openDialogDelete, setOpenDialogDelete] = useState<boolean>(false);
  const [facultyData, setFacultyData] = useState<Facultys[]>([]); // เพิ่มตัวแปรสำหรับเก็บข้อมูล Faculty
  const [facultyID, setFacultyID] = useState<number | null>(null); // เพิ่มตัวแปรสำหรับเก็บ faculty_id ที่เลือก

  const [countDepartments, setCountDepartments] = useState<number>(0);
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
              `http://localhost:3001/department/data?page=${page}&limit=${limit}`,
              {
                withCredentials: true,
              }
            );

            if (response.status === 200) {
              if (response.data.user === null) {
                handleLogout();
              } else {
                setPage(response.data.page);
                setDepartmentData(response.data.departmentData);
                setCountDepartments(response.data.countDepartment);
                setTotalPages(Math.ceil(response.data.countDepartment / limit));
                setNotification(response.data.notification);
                setFacultyData(response.data.facultyData);
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

  const handleAddDepartment = async () => {
    setAdding(true); // ตั้งสถานะการโหลดเป็น true
    if (facultyID === null) {
      setMessage("กรุณาเลือก Faculty");
      setAdding(false); // รีเซ็ตสถานะเมื่อเลือก Faculty ไม่ได้
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:3001/department/addNameDepartment",
        { department_name: departmentName, faculty_id: facultyID },
        { withCredentials: true }
      );

      if (response.status === 201) {
        setMessage("เพิ่มชื่อสาขาสำเร็จ !");
        // อัพเดตข้อมูลใน departmentData ทันที
        setDepartmentData((prev) => [
          ...prev,
          {
            department_id: prev.length + 1,
            department_name: departmentName,
            faculty_id: facultyID,
          }, // เพิ่ม faculty_id
        ]);
        setTimeout(() => {
          setMessage(""); // รีเซ็ตข้อความ
          setOpenDialogAdd(false); // ปิด Dialog
          setDepartmentName(""); // รีเซ็ตชื่อสาขา
          setFacultyID(null); // รีเซ็ต faculty_id
          setAdding(false); // รีเซ็ตสถานะการเพิ่ม
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

  const handleEditDepartment = async () => {
    if (departmentID !== null && facultyID !== null) {
      setAdding(true); // ตั้งสถานะการโหลดเป็น true
      try {
        const response = await axios.put(
          `http://localhost:3001/department/editNameDepartment/${departmentID}`,
          { department_name: departmentName, faculty_id: facultyID },
          { withCredentials: true }
        );

        if (response.status === 201) {
          setMessage("แก้ไขชื่อสาขาสำเร็จ !");
          // อัพเดตข้อมูลใน departmentData ทันที
          setDepartmentData((prev) =>
            prev.map((department) =>
              department.department_id === departmentID
                ? {
                    ...department,
                    department_name: departmentName,
                    faculty_id: facultyID,
                  }
                : department
            )
          );
          setTimeout(() => {
            setMessage(""); // รีเซ็ตข้อความ
            setOpenDialogEdit(false); // ปิด Dialog
            setDepartmentName(""); // รีเซ็ตชื่อสาขา
            setFacultyID(null); // รีเซ็ต faculty_id
            setAdding(false); // รีเซ็ตสถานะการเพิ่ม
          }, 2000);
        } else {
          setMessage(response.data.message);
          setAdding(false);
        }
      } catch (error: any) {
        setMessage("เกิดข้อผิดพลาด");
        setAdding(false);
      }
    } else {
      setMessage("กรุณาเลือก Faculty");
      setAdding(false); // รีเซ็ตสถานะเมื่อไม่มี faculty
    }
  };

  const handleDeleteDepartment = async () => {
    if (departmentID !== null) {
      setAdding(true);
      try {
        const response = await axios.delete(
          `http://localhost:3001/department/deleteDepartment/${departmentID}`,
          { withCredentials: true }
        );

        if (response.status === 201) {
          setMessage("ลบชื่อสาขาสำเร็จ !");
          setTimeout(() => {
            setMessage("");
            setOpenDialogDelete(false); // ปิด Dialog เมื่อการลบเสร็จสิ้น
            setDepartmentData((prev) =>
              prev.filter(
                (department) => department.department_id !== departmentID
              )
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
    setDepartmentName("");
    setMessage("");
  };

  const handleOpenDialogAdd = () => {
    setOpenDialogAdd(true);
  };

  const handleOpenDialogEdit = (
    department_id: number,
    department_name: string,
    faculty_id: number
  ) => {
    setDepartmentID(department_id);
    setDepartmentName(department_name);
    setFacultyID(faculty_id);
    setOpenDialogEdit(true);
  };

  const handleOpenDialogDelete = (
    department_id: number,
    department_name: string
  ) => {
    setDepartmentID(department_id);
    setDepartmentName(department_name);
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
          เพิ่มชื่อสาขา
        </Button>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>สาขา</TableCell>
              <TableCell>คณะ</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {departmentData.map((department, index) => {
              const faculty = facultyData.find(
                (faculty) => faculty.faculty_id === department.faculty_id
              );
              return (
                <TableRow key={index}>
                  <TableCell>{department.department_id}</TableCell>
                  <TableCell>{department.department_name}</TableCell>
                  <TableCell>
                    {faculty ? faculty.faculty_name : "ไม่พบข้อมูล"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() =>
                        handleOpenDialogEdit(
                          department.department_id,
                          department.department_name,
                          department.faculty_id
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
                          department.department_id,
                          department.department_name
                        )
                      }
                    >
                      ลบ
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
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
          จำนวนแผนกทั้งหมด: {countDepartments}
        </Typography>
      </Box>

      {/* Dialogs */}
      {/* Dialog for adding*/}
      <Dialog open={openDialogAdd} onClose={handleCloseDialog}>
        <DialogTitle>เพิ่มชื่อสาขา</DialogTitle>
        <DialogContent>
          <TextField
            label="Department Name"
            fullWidth
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
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
          <Button onClick={handleAddDepartment} color="primary">
            เพิ่ม
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for editing */}
      <Dialog open={openDialogEdit} onClose={handleCloseDialog}>
        <DialogTitle>แก้ไขชื่อสาขา</DialogTitle>
        <DialogContent>
          <TextField
            label="Department Name"
            fullWidth
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
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
          <Button onClick={handleEditDepartment} color="primary">
            แก้ไข
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for deleting */}
      <Dialog open={openDialogDelete} onClose={handleCloseDialog}>
        <DialogTitle>ลบชื่อสาขา</DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {departmentID}. {departmentName}
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
          <Button onClick={handleDeleteDepartment} color="primary">
            ลบ
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Department;
