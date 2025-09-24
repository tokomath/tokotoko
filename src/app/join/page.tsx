import { Suspense } from 'react';
import JoinClient from './JoinClient'; 
import { Box, CircularProgress } from '@mui/material';

const Loading = () => {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ width: '100%', height: '80vh' }}
        >
            <CircularProgress />
        </Box>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<Loading />}>
            <JoinClient />
        </Suspense>
    );
}