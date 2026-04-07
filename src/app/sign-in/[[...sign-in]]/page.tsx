'use client';

import { useState } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Alert,
  Link,
  Grid,
  CircularProgress
} from '@mui/material';

import { msg } from "@/msg-ja";

export default function SignInPage() {
  const { signIn } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const getTranslatedError = (errorObj: any, isSignUp = false) => {
    const errorCode = errorObj?.errors?.[0]?.code || errorObj?.code;
    
    switch (errorCode) {
      case 'form_password_incorrect':
        return msg.ERROR_PASSWORD_INCORRECT;
      case 'form_identifier_not_found':
        return msg.ERROR_USER_NOT_FOUND;
      case 'form_identifier_exists':
        return msg.ERROR_EMAIL_EXISTS;
      case 'form_password_length_too_short':
        return msg.ERROR_PASSWORD_TOO_SHORT;
      case 'form_password_pwned':
        return msg.ERROR_PASSWORD_PWNED;
      case 'invalid_email_address':
        return msg.ERROR_INVALID_EMAIL;
      case 'too_many_requests':
        return msg.ERROR_TOO_MANY_REQUESTS;
      default:
        return isSignUp ? msg.ERROR_SIGN_UP_DEFAULT : msg.ERROR_SIGN_IN_DEFAULT;
    }
  };

  const performSignIn = async () => {
    if (!signIn) return;
    setLoading(true);
    setErrorMsg('');

    const res = await signIn.password({
      emailAddress,
      password,
    });

    if (res?.error) {
      setErrorMsg(getTranslatedError(res.error));
      setPassword('');
      setLoading(false);
      return;
    }

    if (signIn.status === 'complete') {
      await signIn.finalize();
      router.push('/');
    } else {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSignIn();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSignIn();
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
        <Typography variant="h5" component="h1" fontWeight="bold" color="primary" gutterBottom align="center">
          {msg.SIGN_IN_TITLE}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <TextField
                fullWidth
                label={msg.EMAIL_LABEL}
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                disabled={loading}
                required
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label={msg.PASSWORD_LABEL}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                error={!!errorMsg}
                disabled={loading}
                required
              />
            </Grid>

            {errorMsg && (
              <Grid size={12}>
                <Alert severity="error">{errorMsg}</Alert>
              </Grid>
            )}

            <Grid size={12}>
              <Button 
                fullWidth 
                variant="contained" 
                size="large" 
                type="submit" 
                sx={{ mt: 1, minHeight: '48px' }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : msg.SIGN_IN_BUTTON}
              </Button>
            </Grid>
          </Grid>
        </form>

        <Box mt={3} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            {msg.NO_ACCOUNT_TEXT}{' '}
            <Link href="/sign-up" underline="hover" color="primary">
              {msg.GO_TO_SIGN_UP}
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}