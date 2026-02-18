import React, {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Drawer,
    Fab,
    IconButton,
    MenuItem,
    Skeleton,
    TextField,
    Typography,
} from '@mui/material';
import {Add as AddIcon, Close as CloseIcon, Delete as DeleteIcon, FilterList as FilterIcon,} from '@mui/icons-material';
import {ListOperation, OperationFilterDTO, OperationType} from '../../models/Operation';
import {deleteOperation, filterOperations, getOperations} from '../../service/api/operationApi';
import {format, parseISO} from 'date-fns';

const opTypeLabels: Record<OperationType, string> = {
    [OperationType.INCOME]: 'Income',
    [OperationType.OUTCOME]: 'Expense',
    [OperationType.TRANSFER]: 'Transfer',
    [OperationType.OWN]: 'Own',
};

// Available for future use
// const opTypeColors: Record<OperationType, 'success' | 'error' | 'info' | 'warning'> = {
//   [OperationType.INCOME]: 'success',
//   [OperationType.OUTCOME]: 'error',
//   [OperationType.TRANSFER]: 'info',
//   [OperationType.OWN]: 'warning',
// };

export const OperationList: React.FC = () => {
    const navigate = useNavigate();
    const [operations, setOperations] = useState<ListOperation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Filter state
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [filterType, setFilterType] = useState<OperationType | ''>('');
    const [filterActive, setFilterActive] = useState(false);

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const ops = await getOperations();
            const sorted = [...ops].sort(
                (a, b) => new Date(b.operationDate).getTime() - new Date(a.operationDate).getTime()
            );
            setOperations(sorted);
        } catch {
            setError('Failed to load operations');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    const handleFilter = async () => {
        setDrawerOpen(false);
        setLoading(true);
        setError('');
        try {
            const filter: OperationFilterDTO = {
                dateRange: (dateFrom || dateTo) ? {
                    from: dateFrom ? new Date(dateFrom).toISOString() : null,
                    to: dateTo ? new Date(dateTo).toISOString() : null,
                } : null,
                accountIds: null,
                categoryFilter: null,
                notProcessed: null,
                operationTypes: filterType ? [filterType] : null,
            };
            const result = await filterOperations(filter);
            const sorted = [...result].sort(
                (a, b) => new Date(b.operationDate).getTime() - new Date(a.operationDate).getTime()
            );
            setOperations(sorted);
            setFilterActive(true);
        } catch {
            setError('Failed to filter operations');
        }
        setLoading(false);
    };

    const clearFilter = async () => {
        setDateFrom('');
        setDateTo('');
        setFilterType('');
        setFilterActive(false);
        await loadAll();
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this operation?')) return;
        try {
            await deleteOperation(id);
            setOperations(prev => prev.filter(o => o.id !== id));
        } catch {
            setError('Failed to delete');
        }
    };

    // Group operations by date
    const grouped = operations.reduce<Record<string, ListOperation[]>>((acc, op) => {
        const dateKey = op.operationDate
            ? format(parseISO(op.operationDate), 'yyyy-MM-dd')
            : 'Unknown';
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(op);
        return acc;
    }, {});

    if (loading) {
        return (
            <Box>
                {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} variant="rounded" height={60} sx={{mb: 1}}/>
                ))}
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                <Typography variant="h6" fontWeight="bold">
                    Operations
                </Typography>
                <Box>
                    {filterActive && (
                        <Chip label="Filtered" onDelete={clearFilter} color="primary" size="small" sx={{mr: 1}}/>
                    )}
                    <IconButton onClick={() => setDrawerOpen(true)}>
                        <FilterIcon/>
                    </IconButton>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}

            {operations.length === 0 ? (
                <Card>
                    <CardContent>
                        <Typography color="text.secondary" align="center">
                            No operations found.
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                Object.entries(grouped).map(([dateKey, ops]) => (
                    <Box key={dateKey} sx={{mb: 2}}>
                        <Typography variant="caption" color="text.secondary" sx={{pl: 1}}>
                            {dateKey !== 'Unknown' ? format(parseISO(dateKey), 'EEEE, MMM d, yyyy') : 'Unknown date'}
                        </Typography>
                        {ops.map(op => (
                            <Card key={op.id} sx={{mb: 0.5}}>
                                <CardContent sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    py: 1
                                }}>
                                    <Box sx={{flex: 1, minWidth: 0}}>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                            <Typography variant="body2" fontWeight="medium" noWrap>
                                                {op.category?.name || 'No category'}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary" noWrap>
                                            {op.description || ''}
                                            {op.accountOutcome ? ` | ${op.accountOutcome.name}` : ''}
                                            {op.accountIncome ? ` -> ${op.accountIncome.name}` : ''}
                                        </Typography>
                                    </Box>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                        <Box sx={{textAlign: 'right'}}>
                                            {op.income > 0 && (
                                                <Typography variant="body2" color="success.main" fontWeight="bold">
                                                    +{op.income.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                                </Typography>
                                            )}
                                            {op.outcome > 0 && (
                                                <Typography variant="body2" color="error.main" fontWeight="bold">
                                                    -{op.outcome.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                                </Typography>
                                            )}
                                        </Box>
                                        <IconButton size="small" onClick={() => handleDelete(op.id)} color="error">
                                            <DeleteIcon fontSize="small"/>
                                        </IconButton>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                ))
            )}

            {/* Filter Drawer */}
            <Drawer anchor="bottom" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Box sx={{p: 3, maxWidth: 500, mx: 'auto', width: '100%'}}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                        <Typography variant="h6">Filters</Typography>
                        <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon/></IconButton>
                    </Box>

                    <TextField
                        fullWidth
                        label="From Date"
                        type="date"
                        value={dateFrom}
                        onChange={e => setDateFrom(e.target.value)}
                        margin="normal"
                        InputLabelProps={{shrink: true}}
                    />
                    <TextField
                        fullWidth
                        label="To Date"
                        type="date"
                        value={dateTo}
                        onChange={e => setDateTo(e.target.value)}
                        margin="normal"
                        InputLabelProps={{shrink: true}}
                    />
                    <TextField
                        fullWidth
                        select
                        label="Operation Type"
                        value={filterType}
                        onChange={e => setFilterType(e.target.value as OperationType | '')}
                        margin="normal"
                    >
                        <MenuItem value="">All</MenuItem>
                        {Object.values(OperationType).map(t => (
                            <MenuItem key={t} value={t}>{opTypeLabels[t]}</MenuItem>
                        ))}
                    </TextField>

                    <Divider sx={{my: 2}}/>

                    <Box sx={{display: 'flex', gap: 2}}>
                        <Button variant="outlined" fullWidth onClick={clearFilter}>Clear</Button>
                        <Button variant="contained" fullWidth onClick={handleFilter}>Apply</Button>
                    </Box>
                </Box>
            </Drawer>

            <Fab
                color="primary"
                sx={{position: 'fixed', bottom: 80, right: 16}}
                onClick={() => navigate('/operations/new')}
            >
                <AddIcon/>
            </Fab>
        </Box>
    );
};
