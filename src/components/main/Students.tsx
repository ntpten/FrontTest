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
import { Link, Navigate, useNavigate } from "react-router-dom"; // นำเข้า useNavigate

interface User {
  users_id: number;
  username: string;
  password: string;
  roles_id: number; // `roles_id` ควรเป็น number
  roles_name: string;
}

interface Student {
  students_id: number;
  username: string;
  roles_name: string;
  first_name: string;
  last_name: string;
  email: string;
  soft_hours: number;
  hard_hours: number;
  risk_status: string;
  education_status: string;
  faculty_name: string;
  department_name: string;
  level: number;
  date: Date;
}

interface Facultys {
  faculty_id: number;
  faculty_name: string;
}

interface Departments {
  department_id: number;
  department_name: string;
  faculty_id: number;
}

interface Grade {
  grade_id: number;
  level: number;
}

interface EventCoop {
  eventcoop_id: number;
  date: Date;
}

const StudentsData: React.FC = () => {
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

  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [facultyData, setFacultyData] = useState<Facultys[]>([]);
  const [departmentData, setDepartmentData] = useState<Departments[]>([]);
  const [gradeData, setGradeData] = useState<Grade[]>([]);
  const [eventCoopData, setEventCoopData] = useState<EventCoop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [userLocalStorage, setUserLocalStorage] = useState<User | null>(null);

  const [message, setMessage] = useState<string>("");

  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [countStudents, setCountStudents] = useState<number>(0);

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [educationStatus, setEducationStatus] = useState<string>("");

  const [notification, setNotification] = useState<string>("");
  const [loggingOut, setLoggingOut] = useState<boolean>(false); // ✅ เพิ่ม

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
              `http://localhost:3001/students/success?page=${page}&limit=${limit}`,
              { withCredentials: true }
            );

            if (response.status === 200) {
              if (response.data.user === null) {
                // setRedirectToLogin(true);
                handleLogout();
              } else {
                setPage(response.data.page);
                setStudentsData(response.data.studentsData);
                setCountStudents(response.data.countStudents);
                setTotalPages(Math.ceil(response.data.countStudents / limit));
                setFacultyData(response.data.facultyData);
                setDepartmentData(response.data.departmentData);
                setGradeData(response.data.gradeData);
                setEventCoopData(response.data.eventCoopData);
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

  const handleStudents = () => {  
    navigate("/studentsData");
  };
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          {page}
        </Typography>
        <Button onClick={handleStudents} color="primary" variant="contained">
          นิสิตข้อมูลไม่ครบ
        </Button>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>เลขนิสิต</TableCell>
              <TableCell>ประเภท</TableCell>
              <TableCell>ชื่อ</TableCell>
              <TableCell>นามสกุล</TableCell>
              <TableCell>อีเมลล์</TableCell>
              <TableCell>ชั่วโมงซอฟแวร์</TableCell>
              <TableCell>ชั่วโมงฮาดแวร์</TableCell>
              <TableCell>สถานะการอบรมณ์</TableCell>
              <TableCell>สถานะการเรียน</TableCell>
              <TableCell>คณะ</TableCell>
              <TableCell>สาขา</TableCell>
              <TableCell>ชั้นปี</TableCell>
              <TableCell>เวลาสิ้นสุด</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {studentsData.map((students, index) => (
              <TableRow key={index}>
                <TableCell>{students.students_id}</TableCell>
                <TableCell>{students.username}</TableCell>
                <TableCell>{students.roles_name}</TableCell>
                <TableCell>{students.first_name}</TableCell>
                <TableCell>{students.last_name}</TableCell>
                <TableCell>{students.email}</TableCell>
                <TableCell>
                  {students.soft_hours ? students.soft_hours : "0"}
                </TableCell>
                <TableCell>
                  {students.hard_hours ? students.hard_hours : "0"}
                </TableCell>
                <TableCell>
                  {students.risk_status ? students.risk_status : "Null"}
                </TableCell>
                <TableCell>{students.education_status}</TableCell>
                <TableCell>{students.faculty_name}</TableCell>
                <TableCell>{students.department_name}</TableCell>
                <TableCell>{students.level}</TableCell>
                <TableCell>
                  {students.date ? students.date.toString() : "N/A"}
                </TableCell>{" "}
                {/* ตรวจสอบวันที่ก่อน */}
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
          จำนวนนิสิตทั้งหมด: {countStudents}
        </Typography>
      </Box>
    </Container>
  );
};

export default StudentsData;
