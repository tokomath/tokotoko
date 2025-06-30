// app/join/page.tsx (新しく作成するファイル)

import { Suspense } from 'react';
import JoinClient from './JoinClient'; // 下で作成するクライアントコンポーネント
import { Box, CircularProgress } from '@mui/material';

// ローディング中に表示するUI
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