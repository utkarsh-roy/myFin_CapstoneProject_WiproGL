const fs = require('fs');
const path = require('path');

const components = [
  'src/components/Navbar.jsx',
  'src/components/Footer.jsx',
  'src/components/Sidebar.jsx',
  'src/pages/auth/Login.jsx',
  'src/pages/auth/Register.jsx',
  'src/pages/auth/AdminLogin.jsx',
  'src/pages/user/Dashboard.jsx',
  'src/pages/user/Transactions.jsx',
  'src/pages/user/Transfer.jsx',
  'src/pages/user/Investments.jsx',
  'src/pages/user/LoanApplication.jsx',
  'src/pages/user/MyLoans.jsx',
  'src/pages/user/EmiCalculator.jsx',
  'src/pages/user/Chat.jsx',
  'src/pages/user/Notifications.jsx',
  'src/pages/user/Profile.jsx',
  'src/pages/admin/AdminDashboard.jsx',
  'src/pages/admin/ManageUsers.jsx',
  'src/pages/admin/ManageAccounts.jsx',
  'src/pages/admin/ManageLoans.jsx',
  'src/pages/admin/AdminChat.jsx',
  'src/pages/admin/AdminNotifications.jsx'
];

components.forEach(compPath => {
  const fullPath = path.join(__dirname, compPath);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const compName = path.basename(fullPath, '.jsx');
  const boilerplate = `import React from 'react';\nimport { Box, Typography } from '@mui/material';\n\nconst ${compName} = () => {\n  return (\n    <Box sx={{ p: 3 }}>\n      <Typography variant="h4">${compName}</Typography>\n    </Box>\n  );\n};\n\nexport default ${compName};\n`;
  
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, boilerplate);
    console.log(`Created ${compPath}`);
  }
});
