import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Alert, Avatar, Box, Card, CardContent, Chip, Fab, IconButton, Skeleton, Typography,} from '@mui/material';
import {AccountBalance as BankIcon, Add as AddIcon, Delete as DeleteIcon} from '@mui/icons-material';
import {AccountType, ListAccount} from '../../models/Account';
import {deleteAccount, getAccounts} from '../../service/api/accountApi';

const accountTypeLabels: Record<AccountType, string> = {
    [AccountType.CASH]: 'Cash',
    [AccountType.CARD]: 'Card',
    [AccountType.BANK_ACCOUNT]: 'Bank',
    [AccountType.CREDIT]: 'Credit',
    [AccountType.DEPOSIT]: 'Deposit',
};

export const AccountList: React.FC = () => {
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState<ListAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        try {
            setAccounts(await getAccounts());
        } catch {
            setError('Failed to load accounts');
        }
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm('Delete this account?')) return;
        try {
            await deleteAccount(id);
            setAccounts(prev => prev.filter(a => a.id !== id));
        } catch {
            setError('Failed to delete account');
        }
    };

    if (loading) {
        return (
            <Box>
                {[1, 2, 3].map(i => (
                    <Skeleton key={i} variant="rounded" height={72} sx={{mb: 1}}/>
                ))}
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h6" fontWeight="bold" sx={{mb: 2}}>
                Accounts
            </Typography>

            {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}

            {accounts.length === 0 ? (
                <Card>
                    <CardContent>
                        <Typography color="text.secondary" align="center">
                            No accounts yet. Tap + to create one.
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                accounts.map(account => (
                    <Card key={account.id} sx={{mb: 1}}>
                        <CardContent
                            sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5}}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0}}>
                                <Avatar
                                    sx={{bgcolor: 'grey.200', width: 40, height: 40}}
                                    variant="rounded"
                                >
                                    {account.bankIcon ? (
                                        <img src={account.bankIcon} alt="" width={24} height={24}/>
                                    ) : (
                                        <BankIcon sx={{color: 'grey.600'}}/>
                                    )}
                                </Avatar>
                                <Box
                                    sx={{flex: 1, cursor: 'pointer', minWidth: 0}}
                                    onClick={() => navigate(`/accounts/${account.id}`)}
                                >
                                <Typography variant="body1" fontWeight="medium">
                                    {account.name}
                                    {account.savingsAccount && (
                                        <Chip label="Savings" size="small" color="info" sx={{ml: 1}}/>
                                    )}
                                    {account.archiveAccount && (
                                        <Chip label="Archived" size="small" sx={{ml: 1}}/>
                                    )}
                                </Typography>
                                <Chip
                                    label={accountTypeLabels[account.type] || account.type}
                                    size="small"
                                    variant="outlined"
                                    sx={{mt: 0.5}}
                                />
                                </Box>
                            </Box>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <Box
                                    sx={{textAlign: 'right', cursor: 'pointer'}}
                                    onClick={() => navigate(`/accounts/${account.id}`)}
                                >
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
                                <IconButton
                                    size="small"
                                    onClick={(e) => handleDelete(e, account.id)}
                                    color="error"
                                >
                                    <DeleteIcon fontSize="small"/>
                                </IconButton>
                            </Box>
                        </CardContent>
                    </Card>
                ))
            )}

            <Fab
                color="primary"
                sx={{position: 'fixed', bottom: 80, right: 16}}
                onClick={() => navigate('/accounts/new')}
            >
                <AddIcon/>
            </Fab>
        </Box>
    );
};
