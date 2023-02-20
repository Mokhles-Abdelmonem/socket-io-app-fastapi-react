import * as React from 'react';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';


const BasicCard = ({ children, ...other }) => (
    <Card sx={{minWidth: 275}} elevation={12} >
      <CardContent>
            {children}
      </CardContent>
    </Card>
);

BasicCard.propTypes = {
    children: PropTypes.node
};

export default BasicCard;