import React, { useState } from 'react';
import {
    Box, Typography, Paper, TextField, IconButton,
    Avatar, Stack, Chip, Card, CardContent
} from '@mui/material';
import { Send, AutoAwesome, TipsAndUpdates } from '@mui/icons-material';

const Message = ({ text, isBot }) => (
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
                borderTopRightRadius: isBot ? 12 : 0
            }}
        >
            <Typography variant="body1">{text}</Typography>
        </Paper>
    </Box>
);

const Coach = () => {
    const [messages, setMessages] = useState([
        { text: "Hi John! I noticed you've spent 20% more on dining this week. Want to set a quick budget for the weekend?", isBot: true }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages([...messages, { text: input, isBot: false }]);
        setInput('');
        // Mock response
        setTimeout(() => {
            setMessages(prev => [...prev, { text: "I've flagged that for you. Anything else I can help with?", isBot: true }]);
        }, 1000);
    };

    return (
        <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            {/* Header Area */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="h5" fontWeight="bold">Everblue AI</Typography>
                <Typography variant="body2" color="text.secondary">Ask me anything about your spending, budget, or financial goals.</Typography>
            </Box>

            <Grid container spacing={3} sx={{ flexGrow: 1 }}>
                {/* Chats Area */}
                <Grid item xs={12} md={8} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Paper sx={{ mb: 2, flexGrow: 1, p: 3, bgcolor: 'background.default', overflowY: 'auto', borderRadius: 4 }}>
                        {messages.map((msg, i) => (
                            <Message key={i} text={msg.text} isBot={msg.isBot} />
                        ))}
                    </Paper>

                    {/* Input Area */}
                    <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', borderRadius: 4 }}>
                        <TextField
                            fullWidth
                            placeholder="Type your question..."
                            variant="standard"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            InputProps={{ disableUnderline: true, sx: { px: 2 } }}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <IconButton color="primary" onClick={handleSend}>
                            <Send />
                        </IconButton>
                    </Paper>
                </Grid>

                {/* Sidebar Insights */}
                <Grid item xs={12} md={4}>
                    <Stack spacing={2}>
                        <Card>
                            <CardContent>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                    <TipsAndUpdates color="warning" />
                                    <Typography variant="h6" fontSize="1rem" fontWeight="600">Quick Tips</Typography>
                                </Stack>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    • You could save ₹1,500/mo by switching your grocery app.
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    • Your utility bill is due in 3 days.
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent>
                                <Typography variant="h6" fontSize="1rem" fontWeight="600" sx={{ mb: 1 }}>Suggested Prompts</Typography>
                                <Stack spacing={1} direction="row" flexWrap="wrap" useFlexGap>
                                    <Chip label="How am I doing this month?" onClick={() => { }} clickable />
                                    <Chip label="Set a food budget" onClick={() => { }} clickable />
                                    <Chip label="Analyze my travel spend" onClick={() => { }} clickable />
                                </Stack>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};
// Helper import needed for Grid which I forgot to import in the main code block
import { Grid } from '@mui/material';

export default Coach;
