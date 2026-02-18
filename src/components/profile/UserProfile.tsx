import React, {useEffect, useState} from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    TextField,
    Typography,
} from '@mui/material';
import {DeleteForever as DeleteIcon, Logout as LogoutIcon} from '@mui/icons-material';
import {useAuth} from '../../contexts/auth/KeycloakContext';
import {User} from '../../models/User';
import {deleteUserProfile, getUserProfile, updateUserProfile} from '../../service/api/userApi';
import {useSnackbar} from 'notistack';

export const UserProfile: React.FC = () => {
    const {logout} = useAuth();
    const {enqueueSnackbar} = useSnackbar();
    const [user, setUser] = useState<User | null>(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const profile = await getUserProfile();
                setUser(profile);
                setUsername(profile.username);
                setEmail(profile.email);
                setFirstName(profile.firstName || '');
                setLastName(profile.lastName || '');
            } catch {
                setError('Failed to load profile');
            }
            setLoading(false);
        };
        load();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            const updated = await updateUserProfile({username, email, firstName, lastName});
            setUser(updated);
            setSuccess('Profile updated successfully');
            enqueueSnackbar('Profile updated', {variant: 'success'});
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Failed to update profile';
            setError(msg);
            enqueueSnackbar(msg, {variant: 'error'});
        }
        setSaving(false);
    };

    const handleDeleteAccount = async () => {
        try {
            await deleteUserProfile();
            logout();
        } catch {
            setError('Failed to delete account');
        }
        setDeleteDialogOpen(false);
    };

    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                <CircularProgress/>
            </Box>
        );
    }

    const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || '';

    return (
        <Box>
            <Typography variant="h6" fontWeight="bold" sx={{mb: 2}}>
                Profile
            </Typography>

            {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
            {success && <Alert severity="success" sx={{mb: 2}}>{success}</Alert>}

            <Card sx={{mb: 3}}>
                <CardContent sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <Avatar
                        src={user?.picture || undefined}
                        sx={{width: 64, height: 64, bgcolor: 'primary.main', fontSize: 28}}
                    >
                        {!user?.picture && (displayName.charAt(0)?.toUpperCase() || '?')}
                    </Avatar>
                    <Box>
                        <Typography variant="h6">{displayName}</Typography>
                        <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                        {user?.username && user.username !== displayName && (
                            <Typography variant="caption" color="text.secondary">@{user.username}</Typography>
                        )}
                    </Box>
                </CardContent>
            </Card>

            <Card sx={{mb: 3}}>
                <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{mb: 1}}>
                        Edit Profile
                    </Typography>
                    <Box component="form" onSubmit={handleUpdate}>
                        <Box sx={{display: 'flex', gap: 2}}>
                            <TextField
                                fullWidth
                                label="First Name"
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                                margin="normal"
                            />
                            <TextField
                                fullWidth
                                label="Last Name"
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                margin="normal"
                            />
                        </Box>
                        <TextField
                            fullWidth
                            label="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            margin="normal"
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={saving}
                            sx={{mt: 2}}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Divider sx={{my: 2}}/>

            <Button
                variant="outlined"
                fullWidth
                startIcon={<LogoutIcon/>}
                onClick={logout}
                sx={{mb: 2}}
            >
                Log Out
            </Button>

            <Button
                variant="outlined"
                fullWidth
                color="error"
                startIcon={<DeleteIcon/>}
                onClick={() => setDeleteDialogOpen(true)}
            >
                Delete Account
            </Button>

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete your account? This action cannot be undone.
                        All your data will be permanently removed.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteAccount} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
