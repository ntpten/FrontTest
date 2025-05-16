import React from "react";
import { Box, Typography } from "@mui/material";

const Unauthorized: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Typography variant="h4" color="error">
        คุณไม่มีสิทธิ์เข้าถึงหน้านี้
      </Typography>
    </Box>
  );
};

export default Unauthorized;
