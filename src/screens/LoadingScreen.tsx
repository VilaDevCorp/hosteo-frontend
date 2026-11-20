import { Loader } from '@mantine/core';
import logo from '/logo.svg';

export function LoadingScreen({ showLogo }: { showLogo?: boolean }) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                minHeight: '100%',
                gap: '2rem'
            }}
        >
            {showLogo && (
                <img style={{ width: '250px' }} src={logo} alt="Logo" />
            )}
            <Loader size="lg" />
        </div>
    );
}
