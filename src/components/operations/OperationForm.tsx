import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    CircularProgress,
    MenuItem,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';
import {OperationInput, OperationType} from '../../models/Operation';
import {ListAccount} from '../../models/Account';
import {ListCategory} from '../../models/Category';
import {SimplePlace} from '../../models/Place';
import {getAccounts} from '../../service/api/accountApi';
import {getCategories} from '../../service/api/categoryApi';
import {searchPlaces} from '../../service/api/placeApi';
import {createOperation} from '../../service/api/operationApi';
import {format} from 'date-fns';
import {useSnackbar} from 'notistack';

export const OperationForm: React.FC = () => {
    const navigate = useNavigate();
    const {enqueueSnackbar} = useSnackbar();

    const [opType, setOpType] = useState<OperationType>(OperationType.OUTCOME);
    const [categoryId, setCategoryId] = useState<string>('');
    const [accountOutcomeId, setAccountOutcomeId] = useState<string>('');
    const [accountIncomeId, setAccountIncomeId] = useState<string>('');
    const [amount, setAmount] = useState('');
    const [transferIncome, setTransferIncome] = useState('');
    const [operationDate, setOperationDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [description, setDescription] = useState('');
    const [placeId, setPlaceId] = useState<string>('');
    const [placeSearch, setPlaceSearch] = useState('');

    const [accounts, setAccounts] = useState<ListAccount[]>([]);
    const [categories, setCategories] = useState<ListCategory[]>([]);
    const [places, setPlaces] = useState<SimplePlace[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const [accs, cats] = await Promise.all([getAccounts(), getCategories()]);
                setAccounts(accs);
                setCategories(cats);
            } catch {
                setError('Failed to load data');
            }
            setLoading(false);
        };
        load();
    }, []);

    useEffect(() => {
        if (placeSearch.length < 2) return;
        const timer = setTimeout(async () => {
            try {
                setPlaces(await searchPlaces(placeSearch));
            } catch { /* ignore */
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [placeSearch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        const data: OperationInput = {
            category: {id: categoryId},
            accountOutcome: (opType === OperationType.OUTCOME || opType === OperationType.TRANSFER)
                ? {id: accountOutcomeId} : null,
            accountIncome: (opType === OperationType.INCOME || opType === OperationType.TRANSFER || opType === OperationType.OWN)
                ? {id: accountIncomeId} : null,
            operationType: opType,
            operationDate: new Date(operationDate).toISOString(),
            description,
            place: (opType !== OperationType.TRANSFER && placeId) ? {id: placeId} : null,
            income: (opType === OperationType.INCOME || opType === OperationType.OWN)
                ? amount
                : (opType === OperationType.TRANSFER ? (transferIncome || amount) : null),
            outcome: (opType === OperationType.OUTCOME)
                ? amount
                : (opType === OperationType.TRANSFER ? amount : null),
        };

        try {
            await createOperation(data);
            enqueueSnackbar('Operation created successfully', {variant: 'success'});
            navigate('/operations');
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Failed to create operation';
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
                New Operation
            </Typography>

            {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
                <ToggleButtonGroup
                    value={opType}
                    exclusive
                    onChange={(_, v) => v && setOpType(v)}
                    fullWidth
                    size="small"
                    sx={{mb: 2}}
                >
                    <ToggleButton value={OperationType.OUTCOME} color="error">Expense</ToggleButton>
                    <ToggleButton value={OperationType.INCOME} color="success">Income</ToggleButton>
                    <ToggleButton value={OperationType.TRANSFER} color="info">Transfer</ToggleButton>
                </ToggleButtonGroup>

                <TextField
                    fullWidth
                    select
                    label="Category"
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    margin="normal"
                    required
                >
                    {categories
                        .filter(c => {
                            if (opType === OperationType.INCOME) return c.forIncome;
                            if (opType === OperationType.OUTCOME) return c.forOutcome;
                            return true; // TRANSFER and OWN show all
                        })
                        .map(c => (
                            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                        ))}
                </TextField>

                {(opType === OperationType.OUTCOME || opType === OperationType.TRANSFER) && (
                    <TextField
                        fullWidth
                        select
                        label="From Account"
                        value={accountOutcomeId}
                        onChange={e => setAccountOutcomeId(e.target.value)}
                        margin="normal"
                        required
                    >
                        {accounts.map(a => (
                            <MenuItem key={a.id} value={a.id}>
                                {a.name} ({a.currentBalance.toLocaleString()} {a.currency?.symbol || ''})
                            </MenuItem>
                        ))}
                    </TextField>
                )}

                {(opType === OperationType.INCOME || opType === OperationType.TRANSFER || opType === OperationType.OWN) && (
                    <TextField
                        fullWidth
                        select
                        label="To Account"
                        value={accountIncomeId}
                        onChange={e => setAccountIncomeId(e.target.value)}
                        margin="normal"
                        required
                    >
                        {accounts.map(a => (
                            <MenuItem key={a.id} value={a.id}>
                                {a.name} ({a.currentBalance.toLocaleString()} {a.currency?.symbol || ''})
                            </MenuItem>
                        ))}
                    </TextField>
                )}

                <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    margin="normal"
                    required
                    inputProps={{min: 0, step: '0.01'}}
                />

                {opType === OperationType.TRANSFER && (
                    <TextField
                        fullWidth
                        label="Received Amount (if different)"
                        type="number"
                        value={transferIncome}
                        onChange={e => setTransferIncome(e.target.value)}
                        margin="normal"
                        inputProps={{min: 0, step: '0.01'}}
                        helperText="Leave empty if same as sent amount"
                    />
                )}

                <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={operationDate}
                    onChange={e => setOperationDate(e.target.value)}
                    margin="normal"
                    InputLabelProps={{shrink: true}}
                />

                {opType !== OperationType.TRANSFER && (
                    <Autocomplete
                        freeSolo
                        options={places}
                        getOptionLabel={p => (typeof p === 'string' ? p : p.description)}
                        onInputChange={(_, v) => setPlaceSearch(v)}
                        onChange={(_, v) => {
                            if (v && typeof v !== 'string') setPlaceId(v.id);
                        }}
                        renderInput={params => (
                            <TextField {...params} label="Place (optional)" margin="normal"/>
                        )}
                    />
                )}

                <TextField
                    fullWidth
                    label="Description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    margin="normal"
                    multiline
                    rows={2}
                />

                <Box sx={{display: 'flex', gap: 2, mt: 3, mb: 2}}>
                    <Button variant="outlined" fullWidth onClick={() => navigate('/operations')}>
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
