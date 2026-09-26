import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import logo from '/logo.svg';
import styles from './Layout.module.css';
import { Button, Title } from '@mantine/core';
import { useScreen } from '../../../hooks/useScreen';
import { SideNav } from '../sidenav/SideNav';

export function Layout({
    children,
    isPublic,
    customStyles
}: {
    children: React.ReactNode;
    isPublic?: boolean;
    customStyles?: React.CSSProperties;
}) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { isTablet } = useScreen();

    return isPublic || user ? (
        //Public Layout
        isPublic ? (
            <main className={styles.publicMain} style={customStyles}>
                {children}
            </main>
        ) : (
            //Private layout
            <>
                <SideNav />
                <main className={styles.privateMain} style={customStyles}>
                    {children}
                </main>
            </>
        )
    ) : (
        //Not logged in layout
        <div className={styles.notLoggedInWrapper}>
            <main className={styles.notLoggedInMain}>
                <img src={logo} alt="Web logo" className={styles.logo} />
                <Title component={'h3'} order={3}>
                    {'You need an account to view this page'}
                </Title>
                <Button
                    size={isTablet ? 'lg' : 'sm'}
                    onClick={() => navigate('/login')}
                >
                    {'Sign in'}
                </Button>
            </main>
        </div>
    );
}
