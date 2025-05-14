import React from "react";
import { Box, Typography, Link } from "@mui/material";

const Footer: React.FC = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        backgroundColor: "primary.main",
        color: "white",
        textAlign: "center",
        py: 2,
      }}
    >
      <Typography variant="body2">
        &copy; {new Date().getFullYear()} My Application. All rights reserved.
      </Typography>
      <Typography variant="body2">
        <Link href="/terms" color="inherit">
          Terms of Service
        </Link>{" "}
        |{" "}
        <Link href="/privacy" color="inherit">
          Privacy Policy
        </Link>
      </Typography>
    </Box>
  );
};

export default Footer;
