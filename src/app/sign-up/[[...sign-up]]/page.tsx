'use client';

import { useState, useRef } from 'react';
import { useSignUp } from '@clerk/nextjs';
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

export default function SignUpPage() {
  const { signUp } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const getTranslatedError = (errorObj: any, isSignUp = false) => {
    const errorCode = errorObj?.errors?.[0]?.code || errorObj?.code;
    const rawMessage = errorObj?.errors?.[0]?.longMessage || errorObj?.errors?.[0]?.message || errorObj?.message || "";

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
      case 'form_code_incorrect':
      case 'verification_failed':
        return msg.ERROR_INVALID_CODE;
      case 'form_password_nil':
        return msg.ERROR_ENTER_PASSWORD;
      default:
        if (rawMessage.toLowerCase().includes('captcha') || rawMessage.toLowerCase().includes('bot')) {
          return msg.ERROR_BOT_PROTECTION;
        }
        if (rawMessage.includes('is not a function') || rawMessage.includes('undefined')) {
          return msg.ERROR_INTERNAL;
        }
        if (rawMessage) {
          return rawMessage;
        }
        return rawMessage || (isSignUp ? msg.ERROR_SIGN_UP_DEFAULT : msg.ERROR_SIGN_IN_DEFAULT);
    }
  };

  const performSignUp = async () => {
    if (!signUp) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const resCreate = await (signUp as any).create({
        firstName,
        lastName,
        emailAddress,
        password,
      });

      if (resCreate?.error) {
        setErrorMsg(getTranslatedError(resCreate.error, true));
        setPassword('');
        setLoading(false);
        return;
      }

      if (signUp.status === 'complete') {
        await (signUp as any).finalize();
        router.push('/');
        return;
      }

      const resEmail = await (signUp as any).verifications.sendEmailCode();

      if (resEmail?.error) {
        setErrorMsg(getTranslatedError(resEmail.error, true));
        setLoading(false);
        return;
      }

      setPendingVerification(true);
    } catch (err: any) {
      console.error("SignUp Error:", err);
      setErrorMsg(getTranslatedError(err, true));
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  const performVerify = async () => {
    if (!signUp) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await (signUp as any).verifications.verifyEmailCode({
        code: code.join('')
      });

      if (res?.error) {
        setErrorMsg(getTranslatedError(res.error, true));
        setCode(Array(6).fill(''));
        inputRefs.current[0]?.focus();
        setLoading(false);
        return;
      }

      if (signUp.status === 'complete') {
        await (signUp as any).finalize();
        router.push('/');
      } else {
        setLoading(false);
        setErrorMsg(msg.ERROR_VERIFICATION);
      }
    } catch (err: any) {
      console.error("Verify Error:", err);
      setErrorMsg(getTranslatedError(err, true));
      setCode(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSignUp();
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      performVerify();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.some(char => !/^\d$/.test(char))) return;

    const newCode = [...code];
    pastedData.forEach((char, i) => {
      if (i < 6) newCode[i] = char;
    });
    setCode(newCode);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingVerification) {
      performVerify();
    } else {
      performSignUp();
    }
  };

  if (pendingVerification) {
    return (
      <Container maxWidth="sm" sx={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Typography variant="h5" component="h1" fontWeight="bold" color="primary" gutterBottom align="center">
            {msg.VERIFICATION_TITLE}
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={1} justifyContent="center" sx={{ mb: 3, mt: 1 }}>
              {code.map((digit, index) => (
                <Grid size={{ xs: 2 }} key={index}>
                  <TextField
                    inputRef={(el) => { inputRefs.current[index] = el; }}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    disabled={loading}
                    error={!!errorMsg}
                    autoFocus={index === 0}
                    slotProps={{
                      htmlInput: {
                        maxLength: 1,
                        style: { textAlign: 'center', fontSize: '1.5rem', padding: '12px 8px' }
                      }
                    }}
                  />
                </Grid>
              ))}
            </Grid>

            {errorMsg && (
              <Box sx={{ mb: 3 }}>
                <Alert severity="error">{errorMsg}</Alert>
              </Box>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              sx={{ minHeight: '48px' }}
              disabled={loading || code.join('').length < 6}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : msg.VERIFY_BUTTON}
            </Button>
          </form>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
        <Typography variant="h5" component="h1" fontWeight="bold" color="primary" gutterBottom align="center">
          {msg.SIGN_UP_TITLE}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={6}>
              <TextField
                fullWidth
                label={msg.LAST_NAME_LABEL}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={loading}
                required
              />
            </Grid>
            <Grid size={6}>
              <TextField
                fullWidth
                label={msg.FIRST_NAME_LABEL}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading}
                required
              />
            </Grid>
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
                <Alert severity="error" sx={{ wordBreak: 'break-all' }}>{errorMsg}</Alert>
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
                {loading ? <CircularProgress size={24} color="inherit" /> : msg.SIGN_UP_BUTTON}
              </Button>
            </Grid>
          </Grid>
        </form>

        <Box mt={3} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            {msg.ALREADY_HAVE_ACCOUNT}{' '}
            <Link href="/sign-in" underline="hover" color="primary">
              {msg.GO_TO_SIGN_IN}
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}