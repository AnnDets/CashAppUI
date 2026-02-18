import React, {useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Container,
    Divider,
    IconButton,
    InputAdornment,
    Paper,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import {Google, Visibility, VisibilityOff} from '@mui/icons-material';
import {useAuth} from '../../contexts/auth/KeycloakContext';
import {registerUser} from '../../service/api/userApi';

export const LoginPage: React.FC = () => {
    const {loginWithCredentials, loginWithGoogle} = useAuth();
    const [tab, setTab] = useState(0);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await loginWithCredentials(email, password);
        } catch (err: any) {
            setError('Invalid email or password');
        }
        setLoading(false);
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        setLoading(true);
        try {
            await registerUser({email, username, password});
            await loginWithCredentials(email, password);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Registration failed. Please try again.');
        }
        setLoading(false);
    };

    return (
        <Container maxWidth="sm" sx={{pt: 8}}>
            <Paper elevation={3} sx={{p: 4}}>
                <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
                    CashApp
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary" sx={{mb: 3}}>
                    Personal Finance Tracker
                </Typography>

                <Tabs value={tab} onChange={(_, v) => {
                    setTab(v);
                    setError('');
                }} centered sx={{mb: 3}}>
                    <Tab label="Sign In"/>
                    <Tab label="Sign Up"/>
                </Tabs>

                {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}

                {tab === 0 && (
                    <Box component="form" onSubmit={handleSignIn}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            margin="normal"
                            required
                            autoComplete="email"
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            margin="normal"
                            required
                            autoComplete="current-password"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                            {showPassword ? <VisibilityOff/> : <Visibility/>}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{mt: 2, mb: 2}}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </Box>
                )}

                {tab === 1 && (
                    <Box component="form" onSubmit={handleSignUp}>
                        <TextField
                            fullWidth
                            label="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            margin="normal"
                            required
                            autoComplete="username"
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            margin="normal"
                            required
                            autoComplete="email"
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            margin="normal"
                            required
                            autoComplete="new-password"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                            {showPassword ? <VisibilityOff/> : <Visibility/>}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Confirm Password"
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            margin="normal"
                            required
                            autoComplete="new-password"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{mt: 2, mb: 2}}
                        >
                            {loading ? 'Creating account...' : 'Sign Up'}
                        </Button>
                    </Box>
                )}

                <Divider sx={{my: 2}}>or</Divider>

                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Google/>}
                    onClick={loginWithGoogle}
                    size="large"
                >
                    Continue with Google
                </Button>
            </Paper>
        </Container>
    );
};
