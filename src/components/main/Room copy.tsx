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

interface Rooms {
  room_id: number;
  faculty_id: number;
  faculty_name: string;
  building_id: number;
  building_name: string;
  room_name: string;
  floor: string;
  seat_number: number;
  status: string;
}

interface Facultys {
  faculty_id: number;
  faculty_name: string;
}

interface Building {
  building_id: number;
  faculty_id: number;
  building_name: string;
}

const Room: React.FC = () => {
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

  const [roomData, setRoomData] = useState<Rooms[]>([]);
  const [facultyData, setFacultyData] = useState<Facultys[]>([]);
  const [buildingData, setBuildingData] = useState<Building[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [userLocalStorage, setUserLocalStorage] = useState<User | null>(null);

  const [message, setMessage] = useState<string>("");

  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [countRoom, setCountRoom] = useState<number>(0);

  const [roomID, setRoomID] = useState<number | null>(null);
  const [facultyID, setFacultyID] = useState<number | null>(null);
  const [buildingID, setBuildingID] = useState<number | null>(null);
  const [roomName, setRoomName] = useState<string>("");
  const [floor, setFloor] = useState<string>("");
  const [seatNumber, setSeatNumber] = useState<number>(0);
  const [status, setStatus] = useState<string>("");

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
              `http://localhost:3001/room/data?page=${page}&limit=${limit}`,
              { withCredentials: true }
            );

            if (response.status === 200) {
              if (response.data.user === null) {
                // setRedirectToLogin(true);
                handleLogout();
              } else {
                setPage(response.data.page);
                setRoomData(response.data.roomData);
                setCountRoom(response.data.countRoom);
                setTotalPages(Math.ceil(response.data.countRoom / limit));
                setFacultyData(response.data.facultyData);
                setBuildingData(response.data.buildingData);
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
    setRoomName("");
    setFloor("");
    setStatus("");
    setMessage("");
  };

  const handleOpenDialogEdit = (
    room_id: number,
    faculty_id: number,
    building_id: number,
    room_name: string,
    floor: string,
    seat_number: number,
    status: string
  ) => {
    setRoomID(room_id);
    setFacultyID(faculty_id);
    setBuildingID(building_id);
    setRoomName(room_name);
    setFloor(floor);
    setSeatNumber(seat_number);
    setStatus(status);
    setOpenDialogEdit(true);
  };

  const handleEditRoom = async (roomID: number) => {
    setAdding(true);

    // Use a guard to handle possible null or undefined values before calling .trim()
    const requestData = {
      faculty_id: facultyID,
      buildingt_id: buildingID,
      room_name: roomName && roomName.trim(),
      floor: floor && floor.trim(),
      seat_number: seatNumber,
      status: status,
    };

    try {
      const response = await axios.put(
        `http://localhost:3001/room/edit/${roomID}`,
        requestData,
        { withCredentials: true }
      );

      if (response.status === 201) {
        setMessage("แก้ไขข้อมูลห้องสำเร็จ!");
        setRoomData((prev) =>
          prev.map((room) =>
            room.room_id === roomID
              ? {
                  ...room,
                  room_id: roomID,
                  faculty_id: facultyID ?? room.faculty_id,
                  building_id: buildingID ?? room.building_id,
                  room_name: roomName || room.room_name,
                  floor: floor || room.floor,
                  seat_number: seatNumber || room.seat_number,
                  status: status || room.status,
                }
              : room
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
      setMessage("เกิดข้อผิดพลาดในการแก้ไขห้องนิสิต");
      setAdding(false);
    }
  };

  const handleOpenDialogDelete = (room_id: number, room_name: string) => {
    setRoomID(room_id);
    setRoomName(room_name);
    setOpenDialogDelete(true);
  };

  const handleDeleteRoom = async (roomID: number) => {
    setAdding(true);

    try {
      // ส่งคำขอ DELETE ไปที่ API
      const response = await axios.delete(
        `http://localhost:3001/room/delete/${roomID}`,
        { withCredentials: true }
      );

      // ตรวจสอบสถานะการตอบกลับ
      if (response.status === 201) {
        // ใช้ 200 แทน 201 สำหรับการลบ
        setMessage("ลบห้องสำเร็จ !");
        setOpenDialogDelete(false);

        // อัปเดตข้อมูลผู้ใช้ใน UI
        setRoomData((prev) => prev.filter((room) => room.room_id !== roomID));
        setTimeout(() => {
          setMessage("");
          setAdding(false);
        }, 2000);
      } else {
        setMessage(response.data.message);
        setAdding(false);
      }
    } catch (error: any) {
      setMessage("เกิดข้อผิดพลาดในการลบห้อง");
      setAdding(false);
    }
  };

  console.log(facultyData);

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
              <TableCell>คณะ</TableCell>
              <TableCell>ตึก</TableCell>
              <TableCell>ห้อง</TableCell>
              <TableCell>ชั้น</TableCell>
              <TableCell>ที่นั่ง</TableCell>
              <TableCell>สถานะห้อง</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roomData.map((room, index) => {
              const faculty = facultyData.find(
                (faculty) => faculty.faculty_id === room.faculty_id
              );
              const building = buildingData.find(
                (building) => building.building_id === room.building_id
              );
              return (
                <TableRow key={index}>
                  <TableCell>{room.room_id}</TableCell>
                  <TableCell>
                    {faculty ? faculty.faculty_name : "ไม่พบข้อมูล"}
                  </TableCell>
                  <TableCell>
                    {building ? building.building_name : "ไม่พบข้อมูล"}
                  </TableCell>
                  <TableCell>{room.room_name}</TableCell>
                  <TableCell>{room.floor}</TableCell>
                  <TableCell>{room.seat_number}</TableCell>
                  <TableCell>{room.status}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() =>
                        handleOpenDialogEdit(
                          room.room_id,
                          room.faculty_id,
                          room.building_id,
                          room.room_name,
                          room.floor,
                          room.seat_number,
                          room.status
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
                        handleOpenDialogDelete(room.room_id, room.room_name)
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
          จำนวนห้องทั้งหมด: {countRoom}
        </Typography>
      </Box>

      {/* Dialog for editing user */}
      <Dialog open={openDialogEdit} onClose={handleCloseDialog}>
        <DialogTitle>แก้ไขข้อมูลห้อง</DialogTitle>
        <DialogContent>
          <TextField
            label="Room ID"
            fullWidth
            value={roomID}
            disabled // ทำให้ไม่สามารถแก้ไขได้
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

          <TextField
            select
            label="เลือก Building"
            fullWidth
            value={buildingID || ""}
            onChange={(e) => setBuildingID(parseInt(e.target.value))}
            sx={{ mb: 2 }}
          >
            {/* MenuItem สำหรับ default ค่า "ยังไม่มีค่า" */}
            <MenuItem value="">ยังไม่มีค่า</MenuItem>

            {/* รายการ faculty ที่มีอยู่ */}
            {buildingData.map((building) => (
              <MenuItem key={building.building_id} value={building.building_id}>
                {building.building_name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Room Name"
            fullWidth
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Floor"
            fullWidth
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Seat Number"
            fullWidth
            value={seatNumber}
            onChange={(e) => setSeatNumber(Number(e.target.value))}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Status"
            fullWidth
            select
            value={status || ""}
            onChange={(e) => setStatus(e.target.value)}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">ไม่มีค่า</MenuItem>

            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
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
              if (roomID && roomID !== null) {
                handleEditRoom(roomID);
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
        <DialogTitle>ลบห้อง</DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {roomID}. {roomName}
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
              if (roomID) {
                // ตรวจสอบว่า userID มีค่าหรือไม่ก่อนทำการลบ
                handleDeleteRoom(roomID); // ส่ง userID ไปลบ
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

export default Room;
