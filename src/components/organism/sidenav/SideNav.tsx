import {
    IconBed,
    IconCalendarWeek,
    IconEdit,
    IconHome,
    IconLogout,
    IconTemplate,
    IconUsers
} from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './SideNav.module.css';
import logo from '/logo_icon.svg';
import { Menu, Tooltip } from '@mantine/core';
import { Img } from '../../atoms/Img';
import { Button } from '@mantine/core';
import { useAuth } from '../../../hooks/useAuth';
import { ProfileModal } from '../../modals/ProfileModal';
import { useState } from 'react';

const navItems = [
    {
        icon: <IconCalendarWeek size={26} stroke={2.25} />,
        path: '/',
        tooltip: 'Scheduler'
    },
    {
        icon: <IconBed size={26} stroke={2.25} />,
        path: '/events',
        tooltip: 'Events'
    },
    {
        icon: <IconHome size={26} stroke={2.25} />,
        path: '/apartments',
        tooltip: 'Apartments'
    },
    {
        icon: <IconUsers size={26} stroke={2.25} />,
        path: '/workers',
        tooltip: 'Workers'
    },
    {
        icon: <IconTemplate size={26} stroke={2.25} />,
        path: '/templates',
        tooltip: 'Templates'
    }
];

export function SideNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const [profileModalOpened, setProfileModalOpened] = useState(false);

    return (
        <nav className={styles.sideNav}>
            <ul>
                <a
                    onClick={() => navigate('/')}
                    className={styles.navItem}
                    style={{ marginBottom: '0.5rem' }}
                >
                    <img
                        src={logo}
                        alt="Logo"
                        style={{ width: '36px', height: '36px' }}
                    />
                </a>
                {navItems.map((item, index) => (
                    <Tooltip
                        label={item.tooltip}
                        key={index}
                        position="right"
                        withArrow
                    >
                        <a
                            onClick={() => navigate(item.path)}
                            key={index}
                            className={`${location.pathname === item.path ? styles.isActive : ''} ${styles.navItem} `}
                        >
                            {item.icon}
                        </a>
                    </Tooltip>
                ))}
            </ul>
            <Menu position="right-start" withArrow>
                <Menu.Target>
                    <Button
                        variant="transparent"
                        p={0}
                        w={'3rem'}
                        h={'3rem'}
                        radius={'50%'}
                        className={styles.profileButton}
                    >
                        <Img
                            src={useAuth().user?.imageUrl}
                            placeholder="/user_placeholder.svg"
                            alt="User profile"
                            w={'3rem'}
                            h={'3rem'}
                            radius={'50%'}
                            fit="cover"
                        />
                    </Button>
                </Menu.Target>

                <Menu.Dropdown>
                    <Menu.Item
                        leftSection={<IconEdit size={16} />}
                        onClick={() => setProfileModalOpened(true)}
                    >
                        Profile
                    </Menu.Item>
                    <Menu.Item
                        className={styles.logoutButton}
                        leftSection={<IconLogout size={16} />}
                        onClick={() => {
                            logout();
                        }}
                    >
                        Logout
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
            <ProfileModal
                opened={profileModalOpened}
                onClose={() => setProfileModalOpened(false)}
            />
        </nav>
    );
}
