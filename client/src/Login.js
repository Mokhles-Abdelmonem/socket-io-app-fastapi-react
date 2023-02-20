import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { useState, useEffect } from 'react';

import { Formik, Form, Field } from 'formik';
import { LinearProgress } from '@mui/material';
import { TextField } from 'formik-mui';
import Alert from '@mui/material/Alert';
import { loginSchema } from './schemas';

import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from "react-router-dom";
import { login, reset_register_success } from './api/login'

const theme = createTheme();




export default function SignIn() {

  let history = useHistory();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  useEffect(() => {
    if (dispatch && dispatch !== null && dispatch !== undefined)
        dispatch(reset_register_success());
  }, [dispatch]);
  const [alertData, setAlertData] = useState("");

  const onSubmit = async (values, actions) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    actions.resetForm();
    if (dispatch && dispatch !== null && dispatch !== undefined)
    setAlertData("")
    dispatch(login(values.username, values.password))
    .then((res) => setAlertData(res.detail));

  };

  if (typeof window !== 'undefined' && isAuthenticated)
  history.push('/');

  return (
    <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
              <Formik
                initialValues={{ username: "", password: "" }}
                validationSchema={loginSchema}
                onSubmit={onSubmit}
              >
                    {({ isSubmitting }) => (
                <Form>
                  {
                  alertData &&
                  <Alert severity="error">
                    {alertData}
                  </Alert>
                  }
                <Field
                  component={TextField}
                  type="username"
                  margin="normal"
                  fullWidth
                  id="username"
                  label="username"
                  name="username"
                  autoFocus
                />
                <Field
                  component={TextField}
                  margin="normal"
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                />
                <FormControlLabel
                  control={<Checkbox value="remember" color="primary" />}
                  label="Remember me"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isSubmitting}
                >
                  Sign In
                </Button>
                <Grid container>
                  <Grid item xs>
                    <Link href="#" variant="body2">
                      Forgot password?
                    </Link>
                  </Grid>
                  <Grid item>
                    <Link href="/register" variant="body2">
                      {"Don't have an account? Sign Up"}
                    </Link>
                  </Grid>
                </Grid>
                </Form>
                )}
              </Formik>
          </Box>
        </Container>
    </ThemeProvider>
  );
}