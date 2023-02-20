import PropTypes from 'prop-types';

// material-ui
import { Box, Grid, Stack } from '@mui/material';
import AuthBackground from '../assets/images/auth/AuthBackground';
import BasicCard from './BasicCard';

// project import

// assets

// ==============================|| AUTHENTICATION - WRAPPER ||============================== //

const AuthWrapper = ({ children }) => (
    <Box sx={{ minHeight: '100vh' }}>
        <AuthBackground/>
        <Grid
            container
            direction="column"
            justifyContent="flex-end"
            sx={{
                minHeight: '100vh'
            }}
        >
            <Grid item xs={12} sx={{ m: 3, mt: 1 }}>
            </Grid>
            <Grid
                item
                xs={12}
                container
                justifyContent="center"
                alignItems="center"
                sx={{ minHeight: { xs: 'calc(100vh - 134px)', md: 'calc(100vh - 112px)' } }}
            >
                <BasicCard>{children}</BasicCard>
            </Grid>
            <Grid item xs={12} sx={{ m: 3, mt: 1 }}>
            </Grid>
        </Grid>
    </Box>

);

AuthWrapper.propTypes = {
    children: PropTypes.node
};

export default AuthWrapper;
