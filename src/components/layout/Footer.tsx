import React from "react";
import { Box, Link, Typography, Container, Grid, Divider, SxProps, Theme } from "@mui/material";

interface FooterProps {
  marginLeft?: string | number | Record<string, string | number>;
}

const Footer: React.FC<FooterProps> = ({ marginLeft = 0 }) => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: "auto",
        backgroundColor: "background.paper",
        borderTop: 1,
        borderColor: "divider",
        marginLeft,
        transition: (theme) =>
          theme.transitions.create(["margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} justifyContent="space-between">
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Finance Analyzer
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A powerful tool for analyzing personal and business finances.
            </Typography>
          </Grid>

          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle2" color="text.primary" gutterBottom>
              Features
            </Typography>
            <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
              <Box component="li" sx={{ py: 0.5 }}>
                <Link href="/transactions" color="text.secondary" underline="hover">
                  Transactions
                </Link>
              </Box>
              <Box component="li" sx={{ py: 0.5 }}>
                <Link href="/reports" color="text.secondary" underline="hover">
                  Reports
                </Link>
              </Box>
              <Box component="li" sx={{ py: 0.5 }}>
                <Link href="/budgets" color="text.secondary" underline="hover">
                  Budgets
                </Link>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3} md={2}>
            <Typography variant="subtitle2" color="text.primary" gutterBottom>
              Resources
            </Typography>
            <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
              <Box component="li" sx={{ py: 0.5 }}>
                <Link href="#" color="text.secondary" underline="hover">
                  Documentation
                </Link>
              </Box>
              <Box component="li" sx={{ py: 0.5 }}>
                <Link href="#" color="text.secondary" underline="hover">
                  Help Center
                </Link>
              </Box>
              <Box component="li" sx={{ py: 0.5 }}>
                <Link href="#" color="text.secondary" underline="hover">
                  Privacy Policy
                </Link>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: { xs: "center", sm: "space-between" },
            alignItems: "center",
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            © {currentYear} Finance Analyzer. All rights reserved.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mt: { xs: 1, sm: 0 } }}>
            <Link href="#" color="text.secondary" underline="hover">
              <Typography variant="body2">Terms</Typography>
            </Link>
            <Link href="#" color="text.secondary" underline="hover">
              <Typography variant="body2">Privacy</Typography>
            </Link>
            <Link href="#" color="text.secondary" underline="hover">
              <Typography variant="body2">Security</Typography>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
