import {
    IconBed,
    IconCalendarWeek,
    IconHome,
    IconTemplate,
    IconUsers
} from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './SideNav.module.css';
import logo from '/logo_icon.svg';
import { Tooltip } from '@mantine/core';

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
        </nav>
    );
}
