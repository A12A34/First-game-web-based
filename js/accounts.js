// Accounts System for Game Hub
// Uses localStorage to store user data (client-side only)

const AccountSystem = {
    currentUser: null,
    
    // Initialize - check for logged in user
    init() {
        const session = localStorage.getItem('gameHubSession');
        if (session) {
            try {
                this.currentUser = JSON.parse(session);
                this.updateUI();
            } catch (e) {
                localStorage.removeItem('gameHubSession');
            }
        }
        this.createUI();
    },
    
    // Simple hash function for passwords (not cryptographically secure, just for demo)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    },
    
    // Get all users
    getUsers() {
        const users = localStorage.getItem('gameHubUsers');
        return users ? JSON.parse(users) : {};
    },
    
    // Save users
    saveUsers(users) {
        localStorage.setItem('gameHubUsers', JSON.stringify(users));
    },
    
    // Register new user
    register(username, password) {
        if (!username || !password) {
            return { success: false, message: 'Username and password required' };
        }
        
        if (username.length < 3) {
            return { success: false, message: 'Username must be at least 3 characters' };
        }
        
        if (password.length < 4) {
            return { success: false, message: 'Password must be at least 4 characters' };
        }
        
        const users = this.getUsers();
        
        if (users[username.toLowerCase()]) {
            return { success: false, message: 'Username already exists' };
        }
        
        const user = {
            username: username,
            passwordHash: this.hashPassword(password),
            createdAt: Date.now(),
            stats: {
                gamesPlayed: 0,
                totalPlayTime: 0,
                achievements: []
            },
            highScores: {},
            preferences: {
                theme: 'dark'
            }
        };
        
        users[username.toLowerCase()] = user;
        this.saveUsers(users);
        
        return { success: true, message: 'Account created successfully!' };
    },
    
    // Login user
    login(username, password) {
        if (!username || !password) {
            return { success: false, message: 'Username and password required' };
        }
        
        const users = this.getUsers();
        const user = users[username.toLowerCase()];
        
        if (!user) {
            return { success: false, message: 'User not found' };
        }
        
        if (user.passwordHash !== this.hashPassword(password)) {
            return { success: false, message: 'Incorrect password' };
        }
        
        this.currentUser = user;
        localStorage.setItem('gameHubSession', JSON.stringify(user));
        this.updateUI();
        
        return { success: true, message: 'Logged in successfully!' };
    },
    
    // Logout
    logout() {
        this.currentUser = null;
        localStorage.removeItem('gameHubSession');
        this.updateUI();
    },
    
    // Update user data
    updateUser(data) {
        if (!this.currentUser) return;
        
        const users = this.getUsers();
        const userKey = this.currentUser.username.toLowerCase();
        
        Object.assign(users[userKey], data);
        this.saveUsers(users);
        
        this.currentUser = users[userKey];
        localStorage.setItem('gameHubSession', JSON.stringify(this.currentUser));
    },
    
    // Record high score
    recordHighScore(game, score, extraData = {}) {
        if (!this.currentUser) return;
        
        const users = this.getUsers();
        const userKey = this.currentUser.username.toLowerCase();
        
        if (!users[userKey].highScores) {
            users[userKey].highScores = {};
        }
        
        const currentBest = users[userKey].highScores[game]?.score || 0;
        
        if (score > currentBest) {
            users[userKey].highScores[game] = {
                score,
                date: Date.now(),
                ...extraData
            };
            this.saveUsers(users);
            this.currentUser = users[userKey];
            localStorage.setItem('gameHubSession', JSON.stringify(this.currentUser));
            return true; // New high score!
        }
        return false;
    },
    
    // Increment games played
    incrementGamesPlayed() {
        if (!this.currentUser) return;
        
        const users = this.getUsers();
        const userKey = this.currentUser.username.toLowerCase();
        users[userKey].stats.gamesPlayed++;
        this.saveUsers(users);
        this.currentUser = users[userKey];
        localStorage.setItem('gameHubSession', JSON.stringify(this.currentUser));
    },
    
    // Get high scores for a game (all users)
    getLeaderboard(game, limit = 10) {
        const users = this.getUsers();
        const scores = [];
        
        for (const key in users) {
            const user = users[key];
            if (user.highScores && user.highScores[game]) {
                scores.push({
                    username: user.username,
                    score: user.highScores[game].score,
                    date: user.highScores[game].date
                });
            }
        }
        
        return scores.sort((a, b) => b.score - a.score).slice(0, limit);
    },
    
    // Create UI elements
    createUI() {
        // Add account button to page if not exists
        if (!document.getElementById('accountBtn')) {
            const btn = document.createElement('button');
            btn.id = 'accountBtn';
            btn.className = 'account-btn';
            btn.innerHTML = '👤';
            btn.title = 'Account';
            btn.onclick = () => this.showModal();
            document.body.appendChild(btn);
        }
        
        // Create modal if not exists
        if (!document.getElementById('accountModal')) {
            const modal = document.createElement('div');
            modal.id = 'accountModal';
            modal.className = 'account-modal hidden';
            modal.innerHTML = `
                <div class="account-modal-content">
                    <button class="close-modal" onclick="AccountSystem.hideModal()">&times;</button>
                    <div id="accountContent"></div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Close modal when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.hideModal();
            });
        }
        
        // Add styles if not exists
        if (!document.getElementById('accountStyles')) {
            const styles = document.createElement('style');
            styles.id = 'accountStyles';
            styles.textContent = `
                .account-btn {
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    z-index: 1000;
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    font-size: 1.5rem;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .account-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: scale(1.1);
                }
                .account-btn.logged-in {
                    background: rgba(0, 217, 255, 0.3);
                    border: 2px solid #00d9ff;
                }
                .account-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                }
                .account-modal.hidden {
                    display: none;
                }
                .account-modal-content {
                    background: linear-gradient(145deg, #1a1a2e, #16213e);
                    border: 2px solid #00d9ff;
                    border-radius: 20px;
                    padding: 30px;
                    min-width: 350px;
                    max-width: 450px;
                    position: relative;
                    box-shadow: 0 0 30px rgba(0, 217, 255, 0.3);
                }
                .close-modal {
                    position: absolute;
                    top: 10px;
                    right: 15px;
                    background: none;
                    border: none;
                    color: #fff;
                    font-size: 2rem;
                    cursor: pointer;
                }
                .account-form {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                .account-form input {
                    padding: 12px 15px;
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                    font-size: 1rem;
                }
                .account-form input::placeholder {
                    color: #888;
                }
                .account-form button {
                    padding: 12px 20px;
                    border-radius: 10px;
                    border: none;
                    background: linear-gradient(135deg, #00d9ff, #00ff88);
                    color: #1a1a2e;
                    font-weight: bold;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .account-form button:hover {
                    transform: scale(1.02);
                }
                .account-form .secondary-btn {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                .account-tabs {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                .account-tabs button {
                    flex: 1;
                    padding: 10px;
                    border: none;
                    background: rgba(255, 255, 255, 0.1);
                    color: #888;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .account-tabs button.active {
                    background: #00d9ff;
                    color: #1a1a2e;
                }
                .account-error {
                    color: #ff6b6b;
                    font-size: 0.9rem;
                    text-align: center;
                }
                .account-success {
                    color: #00ff88;
                    font-size: 0.9rem;
                    text-align: center;
                }
                .profile-header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .profile-avatar {
                    font-size: 4rem;
                    margin-bottom: 10px;
                }
                .profile-username {
                    font-size: 1.5rem;
                    color: #00d9ff;
                }
                .profile-stats {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                    margin: 20px 0;
                }
                .stat-card {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 15px;
                    border-radius: 10px;
                    text-align: center;
                }
                .stat-card-value {
                    font-size: 1.5rem;
                    color: #00ff88;
                    font-weight: bold;
                }
                .stat-card-label {
                    font-size: 0.8rem;
                    color: #888;
                }
                .high-scores-list {
                    margin-top: 20px;
                }
                .high-score-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                    margin-bottom: 5px;
                }
                .high-score-game {
                    color: #00d9ff;
                }
                .high-score-value {
                    color: #00ff88;
                    font-weight: bold;
                }
            `;
            document.head.appendChild(styles);
        }
        
        this.updateUI();
    },
    
    // Update UI based on login state
    updateUI() {
        const btn = document.getElementById('accountBtn');
        if (btn) {
            btn.classList.toggle('logged-in', !!this.currentUser);
            btn.innerHTML = this.currentUser ? '👤' : '👤';
            btn.title = this.currentUser ? `Logged in as ${this.currentUser.username}` : 'Account';
        }
    },
    
    // Show modal
    showModal() {
        const modal = document.getElementById('accountModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.renderContent();
        }
    },
    
    // Hide modal
    hideModal() {
        const modal = document.getElementById('accountModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },
    
    // Render modal content based on state
    renderContent() {
        const content = document.getElementById('accountContent');
        if (!content) return;
        
        if (this.currentUser) {
            this.renderProfile(content);
        } else {
            this.renderLoginRegister(content);
        }
    },
    
    // Render login/register form
    renderLoginRegister(container) {
        container.innerHTML = `
            <h2 style="text-align: center; margin-bottom: 20px; color: #00d9ff;">Account</h2>
            <div class="account-tabs">
                <button class="active" onclick="AccountSystem.showTab('login')">Login</button>
                <button onclick="AccountSystem.showTab('register')">Register</button>
            </div>
            <div id="loginTab" class="account-form">
                <input type="text" id="loginUsername" placeholder="Username" autocomplete="username">
                <input type="password" id="loginPassword" placeholder="Password" autocomplete="current-password">
                <div id="loginMessage"></div>
                <button onclick="AccountSystem.handleLogin()">Login</button>
            </div>
            <div id="registerTab" class="account-form" style="display: none;">
                <input type="text" id="regUsername" placeholder="Username" autocomplete="username">
                <input type="password" id="regPassword" placeholder="Password" autocomplete="new-password">
                <input type="password" id="regConfirm" placeholder="Confirm Password" autocomplete="new-password">
                <div id="registerMessage"></div>
                <button onclick="AccountSystem.handleRegister()">Create Account</button>
            </div>
        `;
        
        // Add enter key support
        setTimeout(() => {
            document.getElementById('loginPassword')?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleLogin();
            });
            document.getElementById('regConfirm')?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleRegister();
            });
        }, 100);
    },
    
    // Show tab
    showTab(tab) {
        const loginTab = document.getElementById('loginTab');
        const registerTab = document.getElementById('registerTab');
        const tabs = document.querySelectorAll('.account-tabs button');
        
        if (tab === 'login') {
            loginTab.style.display = 'flex';
            registerTab.style.display = 'none';
            tabs[0].classList.add('active');
            tabs[1].classList.remove('active');
        } else {
            loginTab.style.display = 'none';
            registerTab.style.display = 'flex';
            tabs[0].classList.remove('active');
            tabs[1].classList.add('active');
        }
    },
    
    // Handle login
    handleLogin() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const result = this.login(username, password);
        
        const msg = document.getElementById('loginMessage');
        msg.className = result.success ? 'account-success' : 'account-error';
        msg.textContent = result.message;
        
        if (result.success) {
            setTimeout(() => this.renderContent(), 1000);
        }
    },
    
    // Handle register
    handleRegister() {
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirm').value;
        
        const msg = document.getElementById('registerMessage');
        
        if (password !== confirm) {
            msg.className = 'account-error';
            msg.textContent = 'Passwords do not match';
            return;
        }
        
        const result = this.register(username, password);
        msg.className = result.success ? 'account-success' : 'account-error';
        msg.textContent = result.message;
        
        if (result.success) {
            // Auto login after registration
            this.login(username, password);
            setTimeout(() => this.renderContent(), 1000);
        }
    },
    
    // Render profile
    renderProfile(container) {
        const user = this.currentUser;
        const memberDays = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));
        
        let highScoresHtml = '';
        if (user.highScores && Object.keys(user.highScores).length > 0) {
            highScoresHtml = '<div class="high-scores-list"><h4 style="color: #00d9ff; margin-bottom: 10px;">🏆 High Scores</h4>';
            for (const game in user.highScores) {
                const score = user.highScores[game];
                highScoresHtml += `
                    <div class="high-score-item">
                        <span class="high-score-game">${game}</span>
                        <span class="high-score-value">${score.score.toLocaleString()}</span>
                    </div>
                `;
            }
            highScoresHtml += '</div>';
        }
        
        container.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar">👤</div>
                <div class="profile-username">${user.username}</div>
            </div>
            <div class="profile-stats">
                <div class="stat-card">
                    <div class="stat-card-value">${user.stats?.gamesPlayed || 0}</div>
                    <div class="stat-card-label">Games Played</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-value">${memberDays}</div>
                    <div class="stat-card-label">Days as Member</div>
                </div>
            </div>
            ${highScoresHtml}
            <div class="account-form" style="margin-top: 20px;">
                <button class="secondary-btn" onclick="AccountSystem.logout(); AccountSystem.renderContent();">Logout</button>
            </div>
        `;
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AccountSystem.init());
} else {
    AccountSystem.init();
}
