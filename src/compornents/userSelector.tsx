"use client";

import React, { useState, useEffect } from 'react';
import { User } from "@prisma/client";
import {
  TextField,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { getUsersFromQuery } from "@/app/api/User/getUsersFromQuery";
import { msg } from "@/msg-ja";

interface UserSelectorProps {
  role: number;
  onAddUser: (user: User) => void;
  excludeUsers: User[];
}

export function UserSelector({ role, onAddUser, excludeUsers }: UserSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!inputValue) {
        setUsers([]);
        return;
      }
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

  const filteredOptions = users.filter(
    (user) => !excludeUsers.some((excluded) => excluded.id === user.id)
  );

  return (
    <Autocomplete
      options={filteredOptions}
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
          label={role === 0 ? msg.SEARCH_PLACEHOLDER_TEACHER : msg.SEARCH_PLACEHOLDER_STUDENT}
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