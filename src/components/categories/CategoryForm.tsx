import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Alert,
    Autocomplete,
    Avatar,
    Box,
    Button,
    CircularProgress,
    FormControlLabel,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import {CategoryInput} from '../../models/Category';
import {Color, colorToHex, Icon} from '../../models/Config';
import {createCategory} from '../../service/api/categoryApi';
import {getColors, getIcons} from '../../service/api/configApi';
import {useSnackbar} from 'notistack';

export const CategoryForm: React.FC = () => {
    const navigate = useNavigate();
    const {enqueueSnackbar} = useSnackbar();

    const [name, setName] = useState('');
    const [forIncome, setForIncome] = useState(false);
    const [forOutcome, setForOutcome] = useState(true);
    const [mandatoryOutcome, setMandatoryOutcome] = useState(false);
    const [selectedColor, setSelectedColor] = useState<Color | null>(null);
    const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);

    const [colors, setColors] = useState<Color[]>([]);
    const [icons, setIcons] = useState<Icon[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const [c, i] = await Promise.all([getColors(), getIcons()]);
                setColors(c);
                setIcons(i);
            } catch {
                setError('Failed to load config');
            }
            setLoading(false);
        };
        load();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        const data: CategoryInput = {
            name,
            forIncome,
            forOutcome,
            mandatoryOutcome,
            icon: selectedIcon ? {id: selectedIcon.id} : null,
            color: selectedColor ? {id: selectedColor.id} : null,
        };

        try {
            await createCategory(data);
            enqueueSnackbar('Category created', {variant: 'success'});
            navigate('/categories');
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Failed to create category';
            setError(msg);
            enqueueSnackbar(msg, {variant: 'error'});
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                <CircularProgress/>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h6" fontWeight="bold" sx={{mb: 2}}>
                New Category
            </Typography>

            {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Category Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    margin="normal"
                    required
                />

                <Autocomplete
                    options={colors}
                    getOptionLabel={c => colorToHex(c)}
                    value={selectedColor}
                    onChange={(_, v) => setSelectedColor(v)}
                    renderOption={({key, ...props}, option) => (
                        <Box component="li" key={key} {...props} sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <Avatar sx={{bgcolor: colorToHex(option), width: 24, height: 24}}> </Avatar>
                            {colorToHex(option)}
                        </Box>
                    )}
                    renderInput={params => <TextField {...params} label="Color" margin="normal"/>}
                    isOptionEqualToValue={(opt, val) => opt.id === val.id}
                />

                <Autocomplete
                    options={icons}
                    getOptionLabel={() => selectedIcon ? 'Icon selected' : ''}
                    value={selectedIcon}
                    onChange={(_, v) => setSelectedIcon(v)}
                    renderOption={({key, ...props}, option) => (
                        <Box component="li" key={key} {...props} sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <img src={option.data} alt="" width={24} height={24}/>
                        </Box>
                    )}
                    renderInput={params => (
                        <TextField
                            {...params}
                            label="Icon"
                            margin="normal"
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: selectedIcon ? (
                                    <img src={selectedIcon.data} alt="" width={24} height={24}
                                         style={{marginRight: 8}}/>
                                ) : null,
                            }}
                        />
                    )}
                    isOptionEqualToValue={(opt, val) => opt.id === val.id}
                />

                <Box sx={{mt: 2}}>
                    <FormControlLabel
                        control={<Switch checked={forIncome} onChange={e => setForIncome(e.target.checked)}/>}
                        label="For Income"
                    />
                    <FormControlLabel
                        control={<Switch checked={forOutcome} onChange={e => setForOutcome(e.target.checked)}/>}
                        label="For Outcome"
                    />
                    <FormControlLabel
                        control={<Switch checked={mandatoryOutcome}
                                         onChange={e => setMandatoryOutcome(e.target.checked)}/>}
                        label="Mandatory Outcome"
                    />
                </Box>

                <Box sx={{display: 'flex', gap: 2, mt: 3, mb: 2}}>
                    <Button variant="outlined" fullWidth onClick={() => navigate('/categories')}>
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
