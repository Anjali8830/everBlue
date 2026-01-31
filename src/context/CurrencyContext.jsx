import React, { createContext, useState, useContext, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

export const currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
];

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState(() => {
        const saved = localStorage.getItem('app_currency');
        return saved ? JSON.parse(saved) : currencies[0];
    });

    useEffect(() => {
        localStorage.setItem('app_currency', JSON.stringify(currency));
    }, [currency]);

    const changeCurrency = (code) => {
        const selected = currencies.find(c => c.code === code);
        if (selected) setCurrency(selected);
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat(currency.code === 'INR' ? 'en-IN' : 'en-US', {
            style: 'currency',
            currency: currency.code,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <CurrencyContext.Provider value={{ currency, changeCurrency, currencies, formatAmount }}>
            {children}
        </CurrencyContext.Provider>
    );
};
