'use client';

import { useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { 
  Avatar, 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  Typography, 
  Divider, 
  Box 
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

import CustomProfileDialog from './CustomProfileDialog';
import { msg } from "@/msg-ja";

export default function CustomUserButton() {
  const { user } = useUser();
  const { signOut } = useClerk();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!user) return null;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenProfile = () => {
    setDialogOpen(true); 
    handleMenuClose();  
  };

  return (
    <>
      <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
        <Avatar 
          src={user.imageUrl} 
          sx={{ width: 40, height: 40 }} 
        />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            elevation: 3,
            sx: { mt: 1.5, minWidth: 240, borderRadius: 2 }
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar src={user.imageUrl} sx={{ width: 48, height: 48 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" lineHeight={1.2}>
                {user.lastName} {user.firstName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.primaryEmailAddress?.emailAddress}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider />

        <MenuItem onClick={handleOpenProfile} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">{msg.MANAGE}</Typography>
        </MenuItem>

        <MenuItem onClick={() => signOut()} sx={{ py: 1.5, color: 'error.main' }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography variant="body2">
            {msg.SIGN_OUT}
          </Typography>
        </MenuItem>
      </Menu>

      <CustomProfileDialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
      />
    </>
  );
}