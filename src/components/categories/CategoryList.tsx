import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Alert, Avatar, Box, Card, CardContent, Fab, IconButton, Skeleton, Typography,} from '@mui/material';
import {Add as AddIcon, Delete as DeleteIcon} from '@mui/icons-material';
import {ListCategory} from '../../models/Category';
import {colorToHex} from '../../models/Config';
import {deleteCategory, getCategories} from '../../service/api/categoryApi';

export const CategoryList: React.FC = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<ListCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        try {
            setCategories(await getCategories());
        } catch {
            setError('Failed to load categories');
        }
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm('Delete this category?')) return;
        try {
            await deleteCategory(id);
            setCategories(prev => prev.filter(c => c.id !== id));
        } catch {
            setError('Failed to delete category');
        }
    };

    if (loading) {
        return (
            <Box>
                {[1, 2, 3].map(i => (
                    <Skeleton key={i} variant="rounded" height={60} sx={{mb: 1}}/>
                ))}
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h6" fontWeight="bold" sx={{mb: 2}}>
                Categories
            </Typography>

            {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}

            {categories.length === 0 ? (
                <Card>
                    <CardContent>
                        <Typography color="text.secondary" align="center">
                            No categories yet. Tap + to create one.
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                categories.map(cat => (
                    <Card key={cat.id} sx={{mb: 1}}>
                        <CardContent
                            sx={{display: 'flex', alignItems: 'center', py: 1.5, cursor: 'pointer'}}
                            onClick={() => navigate(`/categories/${cat.id}`)}
                        >
                            <Avatar
                                sx={{
                                    bgcolor: cat.color ? colorToHex(cat.color) : 'grey.400',
                                    width: 36,
                                    height: 36,
                                    mr: 2,
                                    fontSize: 14,
                                }}
                            >
                                {cat.icon?.data ? (
                                    <img src={cat.icon.data} alt="" width={20} height={20}/>
                                ) : (
                                    cat.name.charAt(0).toUpperCase()
                                )}
                            </Avatar>
                            <Typography variant="body1" fontWeight="medium" sx={{flex: 1}}>
                                {cat.name}
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={(e) => handleDelete(e, cat.id)}
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
                onClick={() => navigate('/categories/new')}
            >
                <AddIcon/>
            </Fab>
        </Box>
    );
};
