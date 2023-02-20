import * as React from 'react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { changePassword } from '../../actions/auth/changePassword';

import { Formik, Form, Field } from 'formik';
import { passwordSchema } from "../../schemas";
import { TextField } from 'formik-mui';
import Alert from '@mui/material/Alert';


const SecuritySettings = () => {

    const dispatch = useDispatch();
    const router = useRouter();
    const register_success = useSelector(state => state.auth.register_success);
    const loading = useSelector(state => state.auth.loading);
  
  
    const initialState = {
      old_password: '',
      new_password1: '',
      new_password2: '',
      detail: '',
      error: '',
    };

    const [alertData, setAlertData] = useState(initialState);
        
    const {
        old_password,
        new_password1,
        new_password2,
        detail,
        error,
    } = alertData;

    
    const onSubmit = async (values, actions) => {
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      actions.resetForm();

      setAlertData({...initialState})

      if (dispatch && dispatch !== null && dispatch !== undefined)
      dispatch(changePassword(values.old_password, values.new_password1, values.new_password2))
      .then((res) => setAlertData(alertData =>({...alertData,...res,})
      ));
  
    }
  
    return (
      <Box 
      sx={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      >
      <Formik
        initialValues={{ 
          old_password: '',
          new_password1: '',
          new_password2: '',
        }}
        validationSchema={passwordSchema}
        onSubmit={onSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                <Field
                  component={TextField}
                    fullWidth
                    name="old_password"
                    label="old password"
                    type="password"
                    id="old_password"
                    autoComplete="new-password"
                  />
                </Grid>
                {
                old_password &&
                <Grid item xs={12}>
                <Alert severity="error">
                  {old_password}
                </Alert>
                </Grid>
                }
                <Grid item xs={12}>
                <Field
                  component={TextField}
                    fullWidth
                    name="new_password1"
                    label="new password"
                    type="password"
                    id="new_password1"
                    autoComplete="new-password"
                  />
                </Grid>
                {
                new_password1 &&
                <Grid item xs={12}>
                <Alert severity="error">
                  {new_password1}
                </Alert>
                </Grid>
                }
                <Grid item xs={12}>
                <Field
                  component={TextField}
                    fullWidth
                    name="new_password2"
                    label="Re-enter new password"
                    type="password"
                    id="new_password2"
                    autoComplete="re-password"
                  />
                </Grid>
                {
                new_password2 &&
                <Grid item xs={12}>
                <Alert severity="error">
                  {new_password2}
                </Alert>
                </Grid>
                }
              </Grid>
              {
                loading ? (
                <CircularProgress />
                ) : (
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isSubmitting}
                >
                  Save
                </Button>
              )
            }
            {
              detail && 
              <Alert severity="success" color="info">
                {detail}
              </Alert>
            }
            {
              error && 
              <Alert severity="error">
                {error}
              </Alert>
            }
          </Form>
          )}
        </Formik>
      </Box>

    );
  
};

export default SecuritySettings;