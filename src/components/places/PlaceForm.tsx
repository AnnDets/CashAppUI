import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Alert, Box, Button, TextField, Typography,} from '@mui/material';
import {createPlace} from '../../service/api/placeApi';
import {useSnackbar} from 'notistack';

export const PlaceForm: React.FC = () => {
    const navigate = useNavigate();
    const {enqueueSnackbar} = useSnackbar();
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            await createPlace({id: '', description});
            enqueueSnackbar('Place created', {variant: 'success'});
            navigate('/places');
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Failed to create place';
            setError(msg);
            enqueueSnackbar(msg, {variant: 'error'});
        }
        setSaving(false);
    };

    return (
        <Box>
            <Typography variant="h6" fontWeight="bold" sx={{mb: 2}}>
                New Place
            </Typography>

            {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Place Description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    margin="normal"
                    required
                    multiline
                    rows={2}
                />

                <Box sx={{display: 'flex', gap: 2, mt: 3, mb: 2}}>
                    <Button variant="outlined" fullWidth onClick={() => navigate('/places')}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" fullWidth disabled={saving}>
                        {saving ? 'Saving...' : 'Create'}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};
