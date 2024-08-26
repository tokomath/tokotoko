// トップバーに表示するための、ユーザーメニューを表示するコンポーネント
// アイコンとユーザー名を表示し、クリックするとメニューが表示される

import React from 'react';
import { AccountCircle, ExitToAppSharp } from "@mui/icons-material";
import { Button, Menu, MenuItem } from "@mui/material";
import { signOut } from "next-auth/react";
import { ArrowDropDownIcon } from '@mui/x-date-pickers';

interface UserMenuProps {
  user_name: string;
}

export default function UserMenu({ user_name }: UserMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
      <Button
        color="inherit"
        size='large'
        startIcon={<AccountCircle />}
        endIcon={<ArrowDropDownIcon />}
        onClick={handleClick}
        style={{ textTransform: 'none' }}
      >
        {user_name}
      </Button >
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => signOut()}><ExitToAppSharp />SignOut</MenuItem>
      </Menu>
    </>
  );
}