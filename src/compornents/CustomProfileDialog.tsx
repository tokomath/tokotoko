'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser, useSession } from '@clerk/nextjs';
import {
  Dialog,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  Divider,
  Button,
  Chip,
  TextField,
  CircularProgress,
  Grid,
  Stack,
  Paper,
  Checkbox,
  FormControlLabel,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import UploadIcon from '@mui/icons-material/Upload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import { msg } from "@/msg-ja";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CustomProfileDialog({ open, onClose }: Props) {
  const { user } = useUser();
  const { session: currentSession, isLoaded: isSessionLoaded } = useSession();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [sessions, setSessions] = useState<any[]>([]);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [pendingDeleteImage, setPendingDeleteImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signOutOfOtherSessions, setSignOutOfOtherSessions] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const [isReverifying, setIsReverifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && open) {
      user.getSessions().then((res) => setSessions(res));
    }
    if (!open) {
      setIsEditingProfile(false);
      setIsEditingPassword(false);
      setIsReverifying(false);
      setErrorMsg('');
    }
  }, [user, open]);

  const startEditingProfile = () => {
    if (!user) return;
    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
    setPendingImageFile(null);
    setPendingDeleteImage(false);
    setPreviewUrl(null);
    setErrorMsg('');
    setIsEditingProfile(true);
  };

  const startEditingPassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setVerificationCode('');
    setIsReverifying(false);
    setErrorMsg('');
    setIsEditingPassword(true);
  };

  if (!user || !isSessionLoaded || !currentSession) return null;

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    setErrorMsg('');
    try {
      await user.update({ firstName, lastName });
      if (pendingDeleteImage) {
        if (user.hasImage) await (user as any).setProfileImage({ file: null });
      } else if (pendingImageFile) {
        await (user as any).setProfileImage({ file: pendingImageFile });
      }
      setIsEditingProfile(false);
    } catch (err: any) {
      setErrorMsg(err?.errors?.[0]?.message || msg.ERROR_UPDATE_FAILED);
    } finally {
      setIsUpdating(false);
    }
  };

  const executePasswordUpdate = async () => {
    if (user.passwordEnabled) {
      await user.updatePassword({ currentPassword, newPassword, signOutOfOtherSessions });
    } else {
      await (user as any).createPassword({ password: newPassword });
    }
  };

  const handleUpdatePassword = async () => {
    if (user.passwordEnabled && !currentPassword) {
      setErrorMsg(msg.ERROR_ENTER_CURRENT_PASSWORD); return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg(msg.ERROR_PASSWORD_MISMATCH); return;
    }

    setIsUpdating(true);
    setErrorMsg('');
    try {
      await executePasswordUpdate();
      setIsEditingPassword(false);
    } catch (err: any) {
      const errCode = err?.errors?.[0]?.code;
      if (errCode === "session_reverification_required") {
        try {
          await (currentSession as any).prepareReverification({ strategy: 'email_code' });
          setIsReverifying(true);
          setErrorMsg('');
        } catch (authErr: any) {
          setErrorMsg(authErr?.errors?.[0]?.message || "Failed to send code.");
        }
      } else {
        setErrorMsg(err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || msg.ERROR_UPDATE_FAILED);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerifyAndSave = async () => {
    if (!verificationCode) return;
    setIsUpdating(true);
    setErrorMsg('');
    try {
      await (currentSession as any).attemptReverification({ 
        strategy: 'email_code', 
        code: verificationCode 
      });
      await executePasswordUpdate();
      setIsEditingPassword(false);
      setIsReverifying(false);
    } catch (err: any) {
      setErrorMsg(err?.errors?.[0]?.longMessage || msg.ERROR_INVALID_CODE);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingImageFile(file);
      setPendingDeleteImage(false);
      setPreviewUrl(URL.createObjectURL(file));
    }
    e.target.value = "";
  };

  const handleImageDelete = () => {
    setPendingDeleteImage(true);
    setPendingImageFile(null);
    setPreviewUrl(null);
  };

  const getAvatarSrc = () => {
    if (pendingDeleteImage) return undefined;
    if (previewUrl) return previewUrl;
    return user.imageUrl;
  };

  const isDeleteDisabled = (!user.hasImage && !pendingImageFile) || pendingDeleteImage;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 3, minHeight: '600px' } } }}>
      <IconButton onClick={onClose} sx={{ position: 'absolute', right: 16, top: 16, zIndex: 1 }}>
        <CloseIcon />
      </IconButton>

      <Box display="flex" sx={{ height: '600px' }}>
        {/* ★ flexShrink: 0 を追加して、右側の幅が広がっても左側を260pxで固定させる */}
        <Box sx={{ width: 260, flexShrink: 0, bgcolor: '#f5f5f5', p: 3, borderRight: '1px solid #e0e0e0' }}>
          <Typography variant="h5" fontWeight="bold" color="primary">{msg.ACCOUNT_SETTINGS}</Typography>
          <Typography variant="caption" color="textSecondary" sx={{ mb: 4, display: 'block' }}>{msg.MANAGE_ACCOUNT_INFO}</Typography>

          <List>
            <ListItemButton selected={activeTab === 'profile'} onClick={() => { setActiveTab('profile'); setIsEditingProfile(false); }} sx={{ borderRadius: 1.5, mb: 1 }}>
              <ListItemIcon sx={{ minWidth: 40 }}><PersonIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary={msg.PROFILE} />
            </ListItemButton>
            <ListItemButton selected={activeTab === 'security'} onClick={() => { setActiveTab('security'); setIsEditingPassword(false); }} sx={{ borderRadius: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 40 }}><SecurityIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary={msg.SECURITY} />
            </ListItemButton>
          </List>
        </Box>

        <Box sx={{ flexGrow: 1, p: 4, pt: 5, overflowY: 'auto' }}>
          {activeTab === 'profile' ? (
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>{isEditingProfile ? msg.UPDATE_PROFILE_TITLE : msg.PROFILE_DETAILS}</Typography>
              <Divider sx={{ mb: 4 }} />
              {isEditingProfile ? (
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>{msg.PROFILE}</Typography>
                  <Stack direction="row" spacing={3} alignItems="flex-start" sx={{ mb: 4 }}>
                    <Box position="relative">
                      <Avatar src={getAvatarSrc()} sx={{ width: 100, height: 100, borderRadius: 2, bgcolor: "#bdbdbd" }}>
                        {!getAvatarSrc() && <PersonIcon sx={{ fontSize: 60, color: '#fff' }} />}
                      </Avatar>
                    </Box>
                    <Box>
                      <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                        <input type="file" hidden ref={fileInputRef} onChange={handleImageUpload} accept="image/*" />
                        <Button variant="outlined" startIcon={<UploadIcon />} size="small" onClick={() => fileInputRef.current?.click()}>{msg.UPLOAD}</Button>
                        <Button size="small" color="error" onClick={handleImageDelete} disabled={isDeleteDisabled}>{msg.DELETE_ACTION}</Button>
                      </Stack>
                      <Typography variant="caption" color="textSecondary">{msg.RECOMMENDED_SIZE}</Typography>
                    </Box>
                  </Stack>
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid size={6}><TextField fullWidth label={msg.LAST_NAME_LABEL} value={lastName} onChange={(e) => setLastName(e.target.value)} /></Grid>
                    <Grid size={6}><TextField fullWidth label={msg.FIRST_NAME_LABEL} value={firstName} onChange={(e) => setFirstName(e.target.value)} /></Grid>
                  </Grid>
                  {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
                  <Box display="flex" justifyContent="flex-end" gap={2}>
                    <Button onClick={() => setIsEditingProfile(false)} color="inherit">{msg.CANCEL}</Button>
                    <Button variant="contained" onClick={handleUpdateProfile} disabled={isUpdating}>{isUpdating ? <CircularProgress size={24} color="inherit" /> : msg.SAVE}</Button>
                  </Box>
                </Paper>
              ) : (
                <>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>{msg.PROFILE}</Typography>
                  <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={user.imageUrl} sx={{ width: 64, height: 64, borderRadius: 2 }} />
                      <Typography variant="body1" fontWeight="bold">{user.lastName} {user.firstName}</Typography>
                    </Stack>
                    <Button variant="outlined" size="small" onClick={startEditingProfile}>{msg.UPDATE_PROFILE}</Button>
                  </Box>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>{msg.EMAIL_LABEL}</Typography>
                  {user.emailAddresses.map((email) => (
                    <Box key={email.id} display="flex" alignItems="center" gap={1} sx={{ mb: 1.5, p: 1, bgcolor: '#f5f5f5', borderRadius: 1, width: 'fit-content' }}>
                      <Typography variant="body2">{email.emailAddress}</Typography>
                      {email.id === user.primaryEmailAddressId && <Chip label={msg.PRIMARY} size="small" />}
                    </Box>
                  ))}
                </>
              )}
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>{msg.SECURITY}</Typography>
              <Divider sx={{ mb: 4 }} />
              {isEditingPassword ? (
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  {!isReverifying ? (
                    <>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>{msg.UPDATE_PASSWORD_TITLE}</Typography>
                      <Stack spacing={3} sx={{ mb: 3 }}>
                        {user.passwordEnabled && (
                          <TextField fullWidth label={msg.CURRENT_PASSWORD_LABEL} type={showPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                            slotProps={{ input: { endAdornment: <IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton> } }} />
                        )}
                        <TextField fullWidth label={msg.NEW_PASSWORD_LABEL} type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                          slotProps={{ input: { endAdornment: !user.passwordEnabled ? <IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton> : undefined } }} />
                        <TextField fullWidth label={msg.CONFIRM_PASSWORD_LABEL} type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                      </Stack>
                      <FormControlLabel control={<Checkbox checked={signOutOfOtherSessions} onChange={(e) => setSignOutOfOtherSessions(e.target.checked)} />} label={<Typography variant="body2" fontWeight="bold">{msg.SIGN_OUT_OTHER_DEVICES}</Typography>} />
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', ml: 4, mb: 3 }}>{msg.SIGN_OUT_OTHER_DEVICES_DESC}</Typography>
                      {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}
                      <Box display="flex" justifyContent="flex-end" gap={2}>
                        <Button onClick={() => setIsEditingPassword(false)} color="inherit">{msg.CANCEL}</Button>
                        <Button variant="contained" onClick={handleUpdatePassword} disabled={isUpdating || !newPassword || (user.passwordEnabled && !currentPassword)}>
                          {isUpdating ? <CircularProgress size={24} color="inherit" /> : msg.SAVE}
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1 }}>{msg.REVERIFICATION_REQUIRED}</Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                        {msg.REVERIFICATION_DESC}<br />
                        <b>{user.primaryEmailAddress?.emailAddress}</b>
                      </Typography>
                      <TextField fullWidth label={msg.VERIFICATION_CODE_LABEL} value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="123456" autoFocus sx={{ mb: 3 }} />
                      {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Button variant="text" size="small" onClick={() => handleUpdatePassword()} disabled={isUpdating}>{msg.SEND_CODE_AGAIN}</Button>
                        <Box display="flex" gap={2}>
                          <Button onClick={() => setIsReverifying(false)} color="inherit">{msg.CANCEL}</Button>
                          <Button variant="contained" onClick={handleVerifyAndSave} disabled={isUpdating || !verificationCode}>
                            {isUpdating ? <CircularProgress size={24} color="inherit" /> : msg.VERIFY_BUTTON}
                          </Button>
                        </Box>
                      </Box>
                    </>
                  )}
                </Paper>
              ) : (
                <>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>{msg.PASSWORD}</Typography>
                  <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, mb: 5 }}>
                    <Typography variant="body1">••••••••••</Typography>
                    <Button variant="text" size="small" onClick={startEditingPassword} sx={{ color: 'text.secondary', fontWeight: 'bold' }}>{msg.CHANGE_PASSWORD}</Button>
                  </Box>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>{msg.ACTIVE_DEVICES}</Typography>
                  {sessions.map((session) => (
                    <Paper variant="outlined" key={session.id} sx={{ mb: 2, p: 2 }}>
                      <Stack direction="row" spacing={2}>
                        <LaptopMacIcon sx={{ color: 'textSecondary' }} />
                        <Box flex={1}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" fontWeight="bold">{session.latestActivity?.osName || session.latestActivity?.deviceModel || msg.UNKNOWN_DEVICE}</Typography>
                            {session.id === currentSession?.id && <Chip label={msg.THIS_DEVICE} size="small" color="primary" variant="outlined" />}
                          </Stack>
                          <Typography variant="caption" color="textSecondary" display="block">{session.latestActivity?.browserName} ({session.latestActivity?.ipAddress})</Typography>
                          <Typography variant="caption" color="textSecondary">{new Date(session.lastActiveAt).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}{msg.TIME_SUFFIX}</Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  ))}
                </>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Dialog>
  );
}