import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Paper, TextField, IconButton,
    Avatar, Stack, Chip, Card, CardContent, Grid, CircularProgress, Tooltip
} from '@mui/material';
import { Send, AutoAwesome, TipsAndUpdates, Mic, VolumeUp, StopCircle } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import { useCurrency } from '../context/CurrencyContext';

const Message = ({ msg, onToggle, isSpeaking }) => {
    const { text, isBot } = msg;
    return (
        <Box sx={{ display: 'flex', justifyContent: isBot ? 'flex-start' : 'flex-end', mb: 2 }}>
            {isBot && (
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2, width: 32, height: 32 }}>
                    <AutoAwesome sx={{ fontSize: 18 }} />
                </Avatar>
            )}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    maxWidth: '70%',
                    bgcolor: isBot ? 'white' : 'primary.main',
                    color: isBot ? 'text.primary' : 'white',
                    borderRadius: 3,
                    borderTopLeftRadius: isBot ? 0 : 12,
                    borderTopRightRadius: isBot ? 12 : 0,
                    position: 'relative'
                }}
            >
                <Typography variant="body1" sx={{ mr: isBot ? 3 : 0, whiteSpace: 'pre-line' }}>{text}</Typography>
                {isBot && (
                    <IconButton
                        size="small"
                        onClick={() => onToggle(msg)}
                        sx={{ position: 'absolute', bottom: 2, right: 2, p: 0.5, color: isSpeaking ? 'error.main' : 'action.active' }}
                    >
                        {isSpeaking ? <StopCircle fontSize="small" /> : <VolumeUp fontSize="small" />}
                    </IconButton>
                )}
            </Paper>
        </Box>
    );
};

const Coach = () => {
    const { user } = useAuth();
    const { formatAmount } = useCurrency();
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: `Hi ${user?.name || 'there'}! I am your AI Financial Coach. Here is what I can do:
            1. 🎯 Planning: "Plan 1 Lakh holiday"
            2. 🛒 Affordability: "Can I spend 5000 on Shopping?"
            3. 📊 Expense Query: "Shopping spend" or "Cost of Food"
            4. 💰 Status: "What is my balance?" or "Total spending"
            
            How can I help you today?`,
            isBot: true
        }
    ]);
    const [input, setInput] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [speakingMsgId, setSpeakingMsgId] = useState(null);

    // Fetch transactions
    useEffect(() => {
        const fetchContext = async () => {
            if (!user?.email) return;
            try {
                const res = await fetch(`${API_URL}/api/transactions?email=${user.email}`);
                const data = await res.json();
                if (Array.isArray(data)) setTransactions(data);
            } catch (e) {
                console.error("Coach fetch error:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchContext();
    }, [user]);

    // Handle Speech Toggle
    const handleSpeechToggle = (msg) => {
        if ('speechSynthesis' in window) {
            if (speakingMsgId === msg.id) {
                // Currently speaking this msg -> STOP
                window.speechSynthesis.cancel();
                setSpeakingMsgId(null);
            } else {
                // New msg -> STOP PREVIOUS + START NEW
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(msg.text);
                const voices = window.speechSynthesis.getVoices();
                const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
                if (preferredVoice) utterance.voice = preferredVoice;

                utterance.onend = () => setSpeakingMsgId(null);

                setSpeakingMsgId(msg.id);
                window.speechSynthesis.speak(utterance);
            }
        }
    };

    // Speech to Text
    const startListening = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Browser does not support speech recognition. Try Chrome.");
            return;
        }
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            handleSend(transcript);
        };
        recognition.start();
    };

    const generateResponse = (query) => {
        const q = query.toLowerCase();
        const categories = ['food', 'transport', 'shopping', 'entertainment', 'utilities', 'health', 'income'];

        const extractAmount = (str) => {
            const cleanStr = str.replace(/,/g, '');
            if (cleanStr.includes('lakh')) {
                const match = cleanStr.match(/(\d+(\.\d+)?)(\s*)lakh/);
                return match ? parseFloat(match[1]) * 100000 : 0;
            }
            if (cleanStr.includes('k ')) {
                const match = cleanStr.match(/(\d+)k/);
                return match ? parseInt(match[1]) * 1000 : 0;
            }
            const matches = cleanStr.match(/(\d+)/g);
            if (matches) {
                const amounts = matches.map(Number).sort((a, b) => b - a);
                return amounts[0] || 0;
            }
            return 0;
        };

        const targetAmount = extractAmount(q);
        const foundCat = categories.find(c => q.includes(c));

        // INTENT 1: PLANNING
        if (q.includes('plan') || q.includes('holiday') || q.includes('vacation') || q.includes('wedding')) {
            if (targetAmount === 0) return "Planning mode! Tell me the budget (e.g., 'Plan 5 Lakh wedding').";

            const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            const surplus = totalIncome - totalExpense;

            if (surplus <= 0) return `Your expenses exceed income by ${formatAmount(Math.abs(surplus))}. It's hard to plan right now.`;

            const currentBalance = surplus;
            const remainingNeeded = targetAmount - currentBalance;

            if (remainingNeeded <= 0) {
                return `Good news! Your current balance of ${formatAmount(currentBalance)} is already enough for this ${formatAmount(targetAmount)} goal! 🎉`;
            }

            // Assume surplus is the monthly saving rate
            const monthsNeeded = Math.ceil(remainingNeeded / surplus);

            const expByCat = {};
            transactions.filter(t => t.type === 'expense').forEach(t => {
                expByCat[t.category] = (expByCat[t.category] || 0) + t.amount;
            });
            const topCat = Object.keys(expByCat).sort((a, b) => expByCat[b] - expByCat[a])[0];
            const potentialSave = (expByCat[topCat] || 0) * 0.2;

            if (monthsNeeded <= 6) {
                return `You already have ${formatAmount(currentBalance)}. To reach ${formatAmount(targetAmount)}, you need ${formatAmount(remainingNeeded)} more. With ${formatAmount(surplus)}/mo savings, you'll get there in ~${monthsNeeded} months! 🚀`;
            } else {
                return `You need ${formatAmount(remainingNeeded)} more. At current rate, it will take ${monthsNeeded} months. Cutting ${topCat} by 20% could save extra ${formatAmount(potentialSave)}/mo.`;
            }
        }

        // INTENT 2: AFFORDABILITY
        if (targetAmount > 0 && foundCat) {
            const catTotal = transactions
                .filter(t => t.type === 'expense' && t.category.toLowerCase() === foundCat)
                .reduce((sum, t) => sum + t.amount, 0);

            return `You want to spend ${formatAmount(targetAmount)} on ${foundCat}. You've already spent ${formatAmount(catTotal)} this month. proceed with caution if this exceeds your budget!`;
        }

        // INTENT 3: SPENDING
        if (foundCat && (q.includes('spent') || q.includes('spend') || q.includes('cost') || q.includes('much'))) {
            const catTotal = transactions
                .filter(t => t.type === 'expense' && t.category.toLowerCase() === foundCat)
                .reduce((sum, t) => sum + t.amount, 0);
            return `You have spent ${formatAmount(catTotal)} on ${foundCat} so far.`;
        }

        // INTENT 4: BALANCE
        if (q.includes('balance') || q.includes('left') || q.includes('status')) {
            const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            return `Current Balance: ${formatAmount(income - expense)}. (In: ${formatAmount(income)}, Out: ${formatAmount(expense)})`;
        }

        // INTENT 5: TOTAL SPEND
        if (q.includes('total') || q.includes('overall')) {
            const total = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            return `Total expenses: ${formatAmount(total)}.`;
        }

        // INTENT 6: HELP
        if (q.includes('help') || q.includes('what can you do') || q.includes('commands')) {
            return `Here is what I can do:
            1. 🎯 Planning: "Plan 1 Lakh holiday"
            2. 🛒 Affordability: "Can I spend 5000 on Shopping?"
            3. 📊 Expense Query: "Shopping spend" or "Cost of Food"
            4. 💰 Status: "What is my balance?" or "Total spending"
            
            Try asking any of these!`;
        }

        // Default
        return "I can help! Type 'Help' to see all commands. Try: 'Plan 1 Lakh trip', '5000 on Shopping'.";
    };

    const handleSend = (textInput = input) => {
        if (!textInput.trim()) return;

        const timestamp = Date.now();
        const userMsg = { id: timestamp, text: textInput, isBot: false };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        setTimeout(() => {
            const replyText = generateResponse(textInput);
            setMessages(prev => [...prev, { id: timestamp + 1, text: replyText, isBot: true }]);
        }, 800);
    };

    return (
        <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            {/* Header Area */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="h5" fontWeight="bold">Everblue AI Coach 🎙️</Typography>
                <Typography variant="body2" color="text.secondary">Voice-enabled Financial Assistant.</Typography>
            </Box>

            {/* Chats Area */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Paper sx={{ mb: 2, flexGrow: 1, p: 3, bgcolor: 'background.default', overflowY: 'auto', borderRadius: 4 }}>
                    {loading ? <CircularProgress size={20} /> : messages.map((msg, i) => (
                        <Message
                            key={msg.id || i}
                            msg={msg}
                            isSpeaking={speakingMsgId === msg.id}
                            onToggle={handleSpeechToggle}
                        />
                    ))}
                </Paper>

                {/* Input Area + Chips */}
                <Box sx={{ mb: 1 }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 1, overflowX: 'auto', pb: 0.5 }}>
                        <Chip label="Plan for 1 Lakh holiday" onClick={() => handleSend("Plan for 1 Lakh holiday")} clickable color="primary" size="small" />
                        <Chip label="Can I spend 50k on Shopping?" onClick={() => handleSend("Can I spend 50000 on Shopping?")} clickable color="secondary" size="small" />
                        <Chip label="What is my balance?" onClick={() => handleSend("What is my balance?")} clickable size="small" />
                        <Chip label="Total spending" onClick={() => handleSend("Total spending")} clickable size="small" />
                    </Stack>
                    <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', borderRadius: 4 }}>
                        <IconButton
                            color={isListening ? "error" : "default"}
                            onClick={startListening}
                            sx={{ mr: 1 }}
                        >
                            <Mic />
                        </IconButton>
                        <TextField
                            fullWidth
                            placeholder="Type 'Help' or use Mic..."
                            variant="standard"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            InputProps={{ disableUnderline: true, sx: { px: 2 } }}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <IconButton color="primary" onClick={() => handleSend()}>
                            <Send />
                        </IconButton>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default Coach;
