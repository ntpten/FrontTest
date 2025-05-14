import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3001", // กำหนด URL ของ API ที่จะเชื่อมต่อ
    timeout: 1000,
});

export const loginUser = async (username: string, password: string) => {
    try {
        const response = await api.post("/login", { username, password }); // เปลี่ยนจาก email เป็น username
        return response.data;
    } catch (error) {
        throw error;
    }
};
