import React from 'react';
import {Box, CircularProgress, Typography} from '@mui/material';

export const Loader: React.FC<{ message?: string }> = ({message = 'Loading...'}) => (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: 2,
        }}
    >
        <CircularProgress/>
        <Typography variant="body2" color="text.secondary">
            {message}
        </Typography>
    </Box>
);
