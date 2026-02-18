import React, {useState} from 'react';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import {
    AppBar,
    BottomNavigation,
    BottomNavigationAction,
    Box,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Toolbar,
    Typography,
} from '@mui/material';
import {
    AccountBalance as AccountIcon,
    Category as CategoryIcon,
    Dashboard as DashboardIcon,
    MoreHoriz as MoreIcon,
    Person as ProfileIcon,
    Place as PlaceIcon,
    Receipt as OperationIcon,
} from '@mui/icons-material';

const mainNavItems = [
    {label: 'Home', icon: <DashboardIcon/>, path: '/'},
    {label: 'Accounts', icon: <AccountIcon/>, path: '/accounts'},
    {label: 'Operations', icon: <OperationIcon/>, path: '/operations'},
    {label: 'More', icon: <MoreIcon/>, path: '__more__'},
    {label: 'Profile', icon: <ProfileIcon/>, path: '/profile'},
];

const moreMenuItems = [
    {label: 'Categories', icon: <CategoryIcon/>, path: '/categories'},
    {label: 'Places', icon: <PlaceIcon/>, path: '/places'},
];

export const MainLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [moreAnchor, setMoreAnchor] = useState<null | HTMLElement>(null);

    const currentNav = mainNavItems.findIndex(item => {
        if (item.path === '__more__') {
            return moreMenuItems.some(m =>
                location.pathname === m.path || location.pathname.startsWith(m.path + '/')
            );
        }
        if (item.path === '/') return location.pathname === '/';
        return location.pathname.startsWith(item.path);
    });

    const handleNavChange = (_: React.SyntheticEvent, newValue: number) => {
        const item = mainNavItems[newValue];
        if (item.path === '__more__') {
            const target = document.querySelectorAll('.MuiBottomNavigationAction-root')[newValue];
            setMoreAnchor(target as HTMLElement);
        } else {
            navigate(item.path);
        }
    };

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
            <AppBar position="sticky" elevation={1}>
                <Toolbar>
                    <Typography variant="h6" sx={{flexGrow: 1, fontWeight: 'bold'}}>
                        CashApp
                    </Typography>
                </Toolbar>
            </AppBar>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    pb: '72px',
                    px: {xs: 1, sm: 2},
                    pt: 2,
                    maxWidth: 600,
                    mx: 'auto',
                    width: '100%',
                }}
            >
                <Outlet/>
            </Box>

            <Paper
                sx={{position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100}}
                elevation={3}
            >
                <BottomNavigation
                    value={currentNav >= 0 ? currentNav : 0}
                    onChange={handleNavChange}
                    showLabels
                >
                    {mainNavItems.map(item => (
                        <BottomNavigationAction
                            key={item.path}
                            label={item.label}
                            icon={item.icon}
                        />
                    ))}
                </BottomNavigation>
            </Paper>

            <Menu
                anchorEl={moreAnchor}
                open={Boolean(moreAnchor)}
                onClose={() => setMoreAnchor(null)}
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                transformOrigin={{vertical: 'bottom', horizontal: 'center'}}
            >
                {moreMenuItems.map(item => (
                    <MenuItem
                        key={item.path}
                        onClick={() => {
                            setMoreAnchor(null);
                            navigate(item.path);
                        }}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText>{item.label}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
};
