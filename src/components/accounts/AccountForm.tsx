import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {AccountInput, AccountType} from '../../models/Account';
import {Bank, Currency} from '../../models/Config';
import {createAccount, getAccount, updateAccount} from '../../service/api/accountApi';
import {getBanks, getCurrencies} from '../../service/api/configApi';
import {useSnackbar} from 'notistack';

const accountTypes = [
    {value: AccountType.CASH, label: 'Cash'},
    {value: AccountType.CARD, label: 'Card'},
    {value: AccountType.BANK_ACCOUNT, label: 'Bank Account'},
    {value: AccountType.CREDIT, label: 'Credit'},
    {value: AccountType.DEPOSIT, label: 'Deposit'},
];

export const AccountForm: React.FC = () => {
    const navigate = useNavigate();
    const {id} = useParams<{ id: string }>();
    const {enqueueSnackbar} = useSnackbar();
    const isEdit = Boolean(id);

    const [name, setName] = useState('');
    const [type, setType] = useState<AccountType>(AccountType.CARD);
    const [currency, setCurrency] = useState<Currency | null>(null);
    const [bank, setBank] = useState<Bank | null>(null);
    const [creditLimit, setCreditLimit] = useState('0');
    const [currentBalance, setCurrentBalance] = useState('0');
    const [includeInTotal, setIncludeInTotal] = useState(true);
    const [defaultAccount, setDefaultAccount] = useState(false);
    const [savingsAccount, setSavingsAccount] = useState(false);
    const [archiveAccount, setArchiveAccount] = useState(false);
    const [cardNumber1, setCardNumber1] = useState('');
    const [cardNumber2, setCardNumber2] = useState('');
    const [cardNumber3, setCardNumber3] = useState('');
    const [cardNumber4, setCardNumber4] = useState('');

    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const [currList, bankList] = await Promise.all([getCurrencies(), getBanks()]);
                setCurrencies(currList);
                setBanks(bankList);

                if (id) {
                    const acc = await getAccount(id);
                    setName(acc.name);
                    setType(acc.type);
                    setCurrency(acc.currency);
                    setBank(acc.bank);
                    setCreditLimit(String(acc.creditLimit || 0));
                    setCurrentBalance(String(acc.currentBalance || 0));
                    setIncludeInTotal(acc.includeInTotalBalance);
                    setDefaultAccount(acc.defaultAccount);
                    setSavingsAccount(acc.savingsAccount);
                    setArchiveAccount(acc.archiveAccount);
                    setCardNumber1(acc.cardNumber1 || '');
                    setCardNumber2(acc.cardNumber2 || '');
                    setCardNumber3(acc.cardNumber3 || '');
                    setCardNumber4(acc.cardNumber4 || '');
                }
            } catch {
                setError('Failed to load data');
            }
            setLoading(false);
        };
        load();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        const data: AccountInput = {
            name,
            type,
            currency: {id: currency?.id || ''},
            bank: bank ? {id: bank.id} : null,
            creditLimit: parseFloat(creditLimit) || 0,
            currentBalance: parseFloat(currentBalance) || 0,
            includeInTotalBalance: includeInTotal,
            defaultAccount,
            savingsAccount,
            archiveAccount,
            cardNumber1: cardNumber1 || null,
            cardNumber2: cardNumber2 || null,
            cardNumber3: cardNumber3 || null,
            cardNumber4: cardNumber4 || null,
        };

        try {
            if (isEdit && id) {
                await updateAccount(id, data);
                enqueueSnackbar('Account updated', {variant: 'success'});
            } else {
                await createAccount(data);
                enqueueSnackbar('Account created', {variant: 'success'});
            }
            navigate('/accounts');
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Failed to save account';
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
                {isEdit ? 'Edit Account' : 'New Account'}
            </Typography>

            {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Account Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    margin="normal"
                    required
                />

                <TextField
                    fullWidth
                    select
                    label="Type"
                    value={type}
                    onChange={e => setType(e.target.value as AccountType)}
                    margin="normal"
                >
                    {accountTypes.map(t => (
                        <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                    ))}
                </TextField>

                <Autocomplete
                    options={currencies}
                    getOptionLabel={c => `${c.displayName} (${c.symbol})`}
                    value={currency}
                    onChange={(_, v) => setCurrency(v)}
                    renderInput={params => <TextField {...params} label="Currency" margin="normal" required/>}
                    isOptionEqualToValue={(opt, val) => opt.id === val.id}
                />

                <Autocomplete
                    options={banks}
                    getOptionLabel={b => b.displayName}
                    value={bank}
                    onChange={(_, v) => setBank(v)}
                    renderInput={params => <TextField {...params} label="Bank (optional)" margin="normal"/>}
                    isOptionEqualToValue={(opt, val) => opt.id === val.id}
                />

                <TextField
                    fullWidth
                    label="Current Balance"
                    type="number"
                    value={currentBalance}
                    onChange={e => setCurrentBalance(e.target.value)}
                    margin="normal"
                />

                <TextField
                    fullWidth
                    label="Credit Limit"
                    type="number"
                    value={creditLimit}
                    onChange={e => setCreditLimit(e.target.value)}
                    margin="normal"
                />

                {type === AccountType.CARD && (
                    <Box sx={{display: 'flex', gap: 1, mt: 1}}>
                        <TextField label="Card ****" value={cardNumber1} onChange={e => setCardNumber1(e.target.value)}
                                   size="small" sx={{flex: 1}}/>
                        <TextField label="****" value={cardNumber2} onChange={e => setCardNumber2(e.target.value)}
                                   size="small" sx={{flex: 1}}/>
                        <TextField label="****" value={cardNumber3} onChange={e => setCardNumber3(e.target.value)}
                                   size="small" sx={{flex: 1}}/>
                        <TextField label="****" value={cardNumber4} onChange={e => setCardNumber4(e.target.value)}
                                   size="small" sx={{flex: 1}}/>
                    </Box>
                )}

                <Box sx={{mt: 2}}>
                    <FormControlLabel
                        control={<Switch checked={includeInTotal} onChange={e => setIncludeInTotal(e.target.checked)}/>}
                        label="Include in total balance"
                    />
                    <FormControlLabel
                        control={<Switch checked={defaultAccount} onChange={e => setDefaultAccount(e.target.checked)}/>}
                        label="Default account"
                    />
                    <FormControlLabel
                        control={<Switch checked={savingsAccount} onChange={e => setSavingsAccount(e.target.checked)}/>}
                        label="Savings account"
                    />
                    <FormControlLabel
                        control={<Switch checked={archiveAccount} onChange={e => setArchiveAccount(e.target.checked)}/>}
                        label="Archive"
                    />
                </Box>

                <Box sx={{display: 'flex', gap: 2, mt: 3, mb: 2}}>
                    <Button variant="outlined" fullWidth onClick={() => navigate('/accounts')}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" fullWidth disabled={saving}>
                        {saving ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};
