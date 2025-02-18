document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const messageArea = document.getElementById('messageArea');
    const themeToggle = document.getElementById('themeToggle');
    
    // Theme management
    function getPreferredTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    // Initialize theme
    setTheme(getPreferredTheme());

    // Theme toggle handler
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });

    // Create WebSocket connection
    const socket = new WebSocket(`ws://${window.location.host}/ws`);

    function addMessage(text, type = 'sent') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;
        messageArea.appendChild(messageDiv);
        messageArea.scrollTop = messageArea.scrollHeight;
    }

    async function handleSendMessage() {
        const message = messageInput.value;
        if (!message) return;
    
        addMessage(message, 'sent');
    
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    content: message,
                    stream: false 
                }),
            });
    
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to send message');
            }
    
            const data = await response.json();
            addMessage(data.response, 'received');
        } catch (error) {
            console.error('Error sending message:', error);
            addMessage(error.message || 'Error sending message. Please try again.', 'system');
        }
    
        // Clear the input
        messageInput.value = '';
    }

    // WebSocket event handlers
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.error) {
            addMessage(data.error, 'system');
        } else if (data.token) {
            // For streaming responses
            const lastMessage = messageArea.lastElementChild;
            if (lastMessage && lastMessage.classList.contains('received')) {
                lastMessage.textContent += data.token;
            } else {
                addMessage(data.token, 'received');
            }
            messageArea.scrollTop = messageArea.scrollHeight;
        } else if (data.response) {
            addMessage(data.response, 'received');
        }
    };

    socket.onclose = () => {
        addMessage('Connection closed', 'system');
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        addMessage('Connection error', 'system');
    };

    // Event listeners
    sendButton.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    // Make addMessage available globally for AI config
    window.addMessage = addMessage;
});
