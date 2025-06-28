
import React, { useState, useEffect } from 'react';
import { Class, User } from "@prisma/client";


import {
  Button,
  FormControl,
  InputLabel,
  Stack,
  TextField,
  Autocomplete,
  CircularProgress,
  IconButton,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Box,
  SelectChangeEvent,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

import { getUsersFromQuery } from "@/app/api/User/getUsersFromQuery";

interface UserSelectorProps {
  role: number;
  onAddUser: (user: User) => void;
}

export function UserSelector({ role, onAddUser }: UserSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!inputValue) return;
      setLoading(true);
      try {
        const res = await getUsersFromQuery(inputValue, role);
        setUsers(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [inputValue, role]);

  return (
    <Autocomplete
      options={users}
      getOptionLabel={(option) => `${option.name} (${option.email})`}
      loading={loading}
      onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
      onChange={(event, newValue) => {
        if (newValue) {
          onAddUser(newValue);
          setSelectedUser(null);
          setInputValue('');
        }
      }}
      value={selectedUser}
      renderInput={(params) => (
        <TextField
          {...params}
          label={`メールアドレスまたは名前で検索（${role === 0 ? "教師" : "学生"}）`}
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress size={20} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}