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
  faculty_id: number;
  faculty_name: string;
  department_id: number;
  department_name: string;
  grade_id: number;
  eventcoop_id: number;
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

const Students: React.FC = () => {
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

  const [studentsID, setStudentsID] = useState<number | null>(null);
  const [usersID, setUsersID] = useState<number | null>(null);
  const [username, setUsername] = useState<string>("");
  const [roles, setRoles] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [soft, setSoft] = useState<number>(0);
  const [hard, setHard] = useState<number>(0);
  const [risk, setRisk] = useState<string>("");
  const [educationStatus, setEducationStatus] = useState<string>("");
  const [facultyID, setFacultyID] = useState<number | null>(null);
  const [departmentID, setDepartmentID] = useState<number | null>(null);
  const [gradeID, setGradeID] = useState<number | null>(null);
  const [eventCoopID, setEventCoopID] = useState<number | null>(null);

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
              `http://localhost:3001/students/data?page=${page}&limit=${limit}`,
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

  const handleCloseDialog = () => {
    setOpenDialogAdd(false);
    setOpenDialogEdit(false);
    setOpenDialogDelete(false);
    setFirstName("");
    setLastName("");
    setEmail("");
    setEducationStatus("");
    setMessage("");
  };

  const handleOpenDialogEdit = (
    students_id: number,
    username: string,
    roles_name: string,
    first_name: string,
    last_name: string,
    email: string,
    soft_hours: number,
    hard_hours: number,
    risk_status: string,
    education_status: string,
    faculty_id: number,
    department_id: number,
    grade_id: number,
    eventcoop_id: number
  ) => {
    setStudentsID(students_id);
    setUsername(username);
    // setInitialUsername(username);
    setRoles(roles_name);
    setFirstName(first_name);
    setLastName(last_name);
    setEmail(email);
    setSoft(soft_hours);
    setHard(hard_hours);
    setRisk(risk_status);
    setEducationStatus(education_status);
    setFacultyID(faculty_id);
    setDepartmentID(department_id);
    setGradeID(grade_id);
    setEventCoopID(eventcoop_id);
    setOpenDialogEdit(true);
  };

  const handleEditStudents = async (studentsID: number) => {
    setAdding(true);

    // Use a guard to handle possible null or undefined values before calling .trim()
    const requestData = {
      first_name: firstName && firstName.trim() ? firstName.trim() : null, // If firstName is null or empty, set it to null
      last_name: lastName && lastName.trim() ? lastName.trim() : null, // If lastName is null or empty, set it to null
      email: email && email.trim() ? email.trim() : null, // If email is null or empty, set it to null
      education_status:
        educationStatus && educationStatus.trim()
          ? educationStatus.trim()
          : null, // If educationStatus is null or empty, set it to null
      faculty_id: facultyID ?? null, // If facultyID is null, send null
      department_id: departmentID ?? null, // If departmentID is null, send null
      grade_id: gradeID ?? null, // If gradeID is null, send null
      eventcoop_id: eventCoopID ?? null, // If eventCoopID is null, send null
    };

    try {
      const response = await axios.put(
        `http://localhost:3001/students/edit/${studentsID}`,
        requestData,
        { withCredentials: true }
      );

      if (response.status === 201) {
        setMessage("แก้ไขข้อมูลนิสิตสำเร็จ!");
        setStudentsData((prev) =>
          prev.map((students) =>
            students.students_id === studentsID
              ? {
                  ...students,
                  students_id: studentsID,
                  first_name: firstName || students.first_name, // Use the current value if no update
                  last_name: lastName || students.last_name,
                  email: email || students.email,
                  education_status:
                    educationStatus || students.education_status,
                  faculty_id: facultyID ?? students.faculty_id,
                  department_id: departmentID ?? students.department_id,
                  grade_id: gradeID ?? students.grade_id,
                  eventcoop_id: eventCoopID ?? students.eventcoop_id,
                }
              : students
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

  const handleOpenDialogDelete = (students_id: number, username: string) => {
    setStudentsID(students_id);
    setUsername(username);
    setOpenDialogDelete(true);
  };

  const handleDeleteUsers = async (studentsID: number) => {
    setAdding(true);

    try {
      // ส่งคำขอ DELETE ไปที่ API
      const response = await axios.delete(
        `http://localhost:3001/students/delete/${studentsID}`,
        { withCredentials: true }
      );

      // ตรวจสอบสถานะการตอบกลับ
      if (response.status === 201) {
        // ใช้ 200 แทน 201 สำหรับการลบ
        setMessage("ลบผู้ใช้สำเร็จ !");
        setOpenDialogDelete(false);

        // อัปเดตข้อมูลผู้ใช้ใน UI
        setStudentsData((prev) =>
          prev.filter((students) => students.students_id !== studentsID)
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
  const handleStudents = () => {
    navigate("/students");
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          {page}
        </Typography>
        <Button onClick={handleStudents} color="primary" variant="contained">
          นิสิตที่ลงทะเบียนสำเร็จแล้ว 
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
              <TableCell>Actions</TableCell>
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
                <TableCell>{students.soft_hours}</TableCell>
                <TableCell>{students.hard_hours}</TableCell>
                <TableCell>{students.risk_status}</TableCell>
                <TableCell>{students.education_status}</TableCell>
                <TableCell>{students.faculty_id}</TableCell>
                <TableCell>{students.department_id}</TableCell>
                <TableCell>{students.grade_id}</TableCell>
                <TableCell>{students.eventcoop_id}</TableCell>{" "}
                <TableCell>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() =>
                      handleOpenDialogEdit(
                        students.students_id,
                        students.username,
                        students.roles_name,
                        students.first_name,
                        students.last_name,
                        students.email,
                        students.soft_hours,
                        students.hard_hours,
                        students.risk_status,
                        students.education_status,
                        students.faculty_id,
                        students.department_id,
                        students.grade_id,
                        students.eventcoop_id
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
                        students.students_id,
                        students.username
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
          จำนวนนิสิตทั้งหมด: {countStudents}
        </Typography>
      </Box>

      {/* Dialog for editing user */}
      <Dialog open={openDialogEdit} onClose={handleCloseDialog}>
        <DialogTitle>แก้ไขข้อมูลผู้ใช้</DialogTitle>
        <DialogContent>
          <TextField
            label="Students ID"
            fullWidth
            value={studentsID}
            disabled // ทำให้ไม่สามารถแก้ไขได้
            sx={{ mb: 2 }}
          />

          <TextField
            label="Username"
            fullWidth
            value={username}
            disabled // ทำให้ไม่สามารถแก้ไขได้
            sx={{ mb: 2 }}
          />

          <TextField
            label="Roles"
            fullWidth
            value={roles}
            disabled // ทำให้ไม่สามารถแก้ไขได้
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
            label="Email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Soft"
            fullWidth
            value={soft}
            disabled // ทำให้ไม่สามารถแก้ไขได้
            sx={{ mb: 2 }}
          />
          <TextField
            label="Hard"
            fullWidth
            value={hard}
            disabled // ทำให้ไม่สามารถแก้ไขได้
            sx={{ mb: 2 }}
          />
          <TextField
            label="Risk Status"
            fullWidth
            value={risk}
            disabled // ทำให้ไม่สามารถแก้ไขได้
            sx={{ mb: 2 }}
          />
          <TextField
            label="Education Status"
            fullWidth
            select
            value={educationStatus || ""}
            onChange={(e) => setEducationStatus(e.target.value)}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">ไม่มีค่า</MenuItem>

            <MenuItem value="Studying">Studying</MenuItem>
            <MenuItem value="Graduate">Graduate</MenuItem>
          </TextField>

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
          <TextField
            select
            label="เลือก Department"
            fullWidth
            value={departmentID || ""}
            onChange={(e) => setDepartmentID(parseInt(e.target.value))}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">ยังไม่มีค่า</MenuItem>

            {departmentData.map((department) => (
              <MenuItem
                key={department.department_id}
                value={department.department_id}
              >
                {department.department_name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="เลือก ชั้นปี"
            fullWidth
            value={gradeID || ""}
            onChange={(e) => setGradeID(parseInt(e.target.value))}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">ยังไม่มีค่า</MenuItem>

            {gradeData.map((grade) => (
              <MenuItem key={grade.grade_id} value={grade.grade_id}>
                {grade.level}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="เลือก วันสิ้นสุดกิจกรรม"
            fullWidth
            value={eventCoopID || ""}
            onChange={(e) => setEventCoopID(parseInt(e.target.value))}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">ยังไม่มีค่า</MenuItem>

            {eventCoopData.map((eventcoop) => (
              <MenuItem
                key={eventcoop.eventcoop_id}
                value={eventcoop.eventcoop_id}
              >
                {eventcoop.date.toString()}
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
              if (studentsID && studentsID !== null) {
                handleEditStudents(studentsID);
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
            {studentsID}. {username}
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
              if (studentsID) {
                // ตรวจสอบว่า userID มีค่าหรือไม่ก่อนทำการลบ
                handleDeleteUsers(studentsID); // ส่ง userID ไปลบ
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

export default Students;
