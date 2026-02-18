import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Alert, Box, Card, CardActionArea, CardContent, Chip, Divider, Fab, Skeleton, Typography,} from '@mui/material';
import {Add as AddIcon} from '@mui/icons-material';
import {AccountType, ListAccount} from '../../models/Account';
import {ListOperation} from '../../models/Operation';
import {getAccounts} from '../../service/api/accountApi';
import {getOperations} from '../../service/api/operationApi';
import {format, parseISO} from 'date-fns';

const accountTypeLabels: Record<AccountType, string> = {
    [AccountType.CASH]: 'Cash',
    [AccountType.CARD]: 'Card',
    [AccountType.BANK_ACCOUNT]: 'Bank',
    [AccountType.CREDIT]: 'Credit',
    [AccountType.DEPOSIT]: 'Deposit',
};

// Available for future use: operation type chip colors
// const operationTypeColors: Record<OperationType, 'success' | 'error' | 'info' | 'warning'> = {
//   [OperationType.INCOME]: 'success',
//   [OperationType.OUTCOME]: 'error',
//   [OperationType.TRANSFER]: 'info',
//   [OperationType.OWN]: 'warning',
// };

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState<ListAccount[]>([]);
    const [operations, setOperations] = useState<ListOperation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const [acc, ops] = await Promise.all([getAccounts(), getOperations()]);
                setAccounts(acc);
                // Show last 10 operations, sorted by date desc
                const sorted = [...ops].sort(
                    (a, b) => new Date(b.operationDate).getTime() - new Date(a.operationDate).getTime()
                );
                setOperations(sorted.slice(0, 10));
            } catch (err) {
                setError('Failed to load data');
            }
            setLoading(false);
        };
        load();
    }, []);

    const totalBalance = accounts
        .filter(a => !a.archiveAccount)
        .reduce((sum, a) => sum + Number(a.currentBalance), 0);

    if (loading) {
        return (
            <Box>
                <Skeleton variant="rounded" height={80} sx={{mb: 2}}/>
                <Skeleton variant="rounded" height={60} sx={{mb: 1}}/>
                <Skeleton variant="rounded" height={60} sx={{mb: 1}}/>
                <Skeleton variant="rounded" height={60}/>
            </Box>
        );
    }

    return (
        <Box>
            {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}

            {/* Total Balance Card */}
            <Card sx={{mb: 2, bgcolor: 'primary.main', color: 'white'}}>
                <CardContent sx={{textAlign: 'center'}}>
                    <Typography variant="body2" sx={{opacity: 0.8}}>
                        Total Balance
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                        {totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </Typography>
                    <Typography variant="body2" sx={{opacity: 0.8, mt: 0.5}}>
                        {accounts.filter(a => !a.archiveAccount).length} active account(s)
                    </Typography>
                </CardContent>
            </Card>

            {/* Accounts */}
            <Typography variant="subtitle1" fontWeight="bold" sx={{mb: 1}}>
                Accounts
            </Typography>
            {accounts.length === 0 ? (
                <Card sx={{mb: 2}}>
                    <CardContent>
                        <Typography color="text.secondary" align="center">
                            No accounts yet. Create one to get started!
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                accounts.filter(a => !a.archiveAccount).map(account => (
                    <Card key={account.id} sx={{mb: 1}}>
                        <CardActionArea onClick={() => navigate(`/accounts/${account.id}`)}>
                            <CardContent
                                sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5}}>
                                <Box>
                                    <Typography variant="body1" fontWeight="medium">
                                        {account.name}
                                    </Typography>
                                    <Chip
                                        label={accountTypeLabels[account.type] || account.type}
                                        size="small"
                                        variant="outlined"
                                        sx={{mt: 0.5}}
                                    />
                                </Box>
                                <Box sx={{textAlign: 'right'}}>
                                    <Typography
                                        variant="body1"
                                        fontWeight="bold"
                                        color={Number(account.currentBalance) >= 0 ? 'success.main' : 'error.main'}
                                    >
                                        {Number(account.currentBalance).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {account.currency?.symbol || account.currency?.id || ''}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                ))
            )}

            <Divider sx={{my: 2}}/>

            {/* Recent Operations */}
            <Typography variant="subtitle1" fontWeight="bold" sx={{mb: 1}}>
                Recent Operations
            </Typography>
            {operations.length === 0 ? (
                <Card>
                    <CardContent>
                        <Typography color="text.secondary" align="center">
                            No operations yet.
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                operations.map(op => (
                    <Card key={op.id} sx={{mb: 1}}>
                        <CardContent
                            sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5}}>
                            <Box>
                                <Typography variant="body2" fontWeight="medium">
                                    {op.category?.name || 'No category'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {op.operationDate ? format(parseISO(op.operationDate), 'MMM d, yyyy') : ''}
                                    {op.description ? ` - ${op.description}` : ''}
                                </Typography>
                            </Box>
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
                                {op.accountOutcome && (
                                    <Typography variant="caption" color="text.secondary">
                                        {op.accountOutcome.name}
                                    </Typography>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                ))
            )}

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
