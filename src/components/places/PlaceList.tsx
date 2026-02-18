import React, {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Alert,
    Box,
    Card,
    CardContent,
    Fab,
    IconButton,
    InputAdornment,
    Skeleton,
    TextField,
    Typography,
} from '@mui/material';
import {Add as AddIcon, Delete as DeleteIcon, Search as SearchIcon} from '@mui/icons-material';
import {SimplePlace} from '../../models/Place';
import {deletePlace, searchPlaces} from '../../service/api/placeApi';
import {useSnackbar} from 'notistack';

export const PlaceList: React.FC = () => {
    const navigate = useNavigate();
    const {enqueueSnackbar} = useSnackbar();
    const [places, setPlaces] = useState<SimplePlace[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(async (query: string) => {
        setLoading(true);
        setError('');
        try {
            setPlaces(await searchPlaces(query));
        } catch {
            setError('Failed to search places');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        load('');
    }, [load]);

    useEffect(() => {
        const timer = setTimeout(() => {
            load(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, load]);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm('Delete this place?')) return;
        try {
            await deletePlace(id);
            setPlaces(prev => prev.filter(p => p.id !== id));
            enqueueSnackbar('Place deleted', {variant: 'success'});
        } catch {
            enqueueSnackbar('Failed to delete place', {variant: 'error'});
        }
    };

    return (
        <Box>
            <Typography variant="h6" fontWeight="bold" sx={{mb: 2}}>
                Places
            </Typography>

            <TextField
                fullWidth
                placeholder="Search places..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                size="small"
                sx={{mb: 2}}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon/>
                        </InputAdornment>
                    ),
                }}
            />

            {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}

            {loading ? (
                <Box>
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} variant="rounded" height={50} sx={{mb: 1}}/>
                    ))}
                </Box>
            ) : places.length === 0 ? (
                <Card>
                    <CardContent>
                        <Typography color="text.secondary" align="center">
                            {search ? 'No places found.' : 'No places yet. Tap + to create one.'}
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                places.map(place => (
                    <Card key={place.id} sx={{mb: 1}}>
                        <CardContent
                            sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5}}>
                            <Typography variant="body1" sx={{flex: 1}}>
                                {place.description}
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={(e) => handleDelete(e, place.id)}
                                color="error"
                            >
                                <DeleteIcon fontSize="small"/>
                            </IconButton>
                        </CardContent>
                    </Card>
                ))
            )}

            <Fab
                color="primary"
                sx={{position: 'fixed', bottom: 80, right: 16}}
                onClick={() => navigate('/places/new')}
            >
                <AddIcon/>
            </Fab>
        </Box>
    );
};
