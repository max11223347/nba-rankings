(function() {
    let currentView = 'ranking';
    let filteredPlayers = [...PLAYERS_DATA];
    let favorites = JSON.parse(localStorage.getItem('nba-favorites')) || [];
    let weights = {
        offense: 0.30,
        defense: 0.25,
        playmaking: 0.20,
        physical: 0.15,
        bbiq: 0.10
    };

    const weightPresets = {
        balanced: { offense: 0.30, defense: 0.25, playmaking: 0.20, physical: 0.15, bbiq: 0.10 },
        offense: { offense: 0.50, defense: 0.15, playmaking: 0.15, physical: 0.12, bbiq: 0.08 },
        defense: { offense: 0.15, defense: 0.45, playmaking: 0.15, physical: 0.15, bbiq: 0.10 },
        playmaking: { offense: 0.20, defense: 0.15, playmaking: 0.40, physical: 0.10, bbiq: 0.15 }
    };

    const weightCategories = {
        offense: {
            label: '进攻能力',
            icon: 'flame',
            items: {
                scoring: '得分能力',
                efficiency: '得分效率',
                ballHandling: '持球进攻',
                offBall: '无球能力',
                clutch: '关键球'
            }
        },
        defense: {
            label: '防守能力',
            icon: 'shield',
            items: {
                defense: '总体防守',
                perimeter: '外线防守',
                interior: '内线防守',
                rebounding: '篮板',
                blocks: '盖帽'
            }
        },
        playmaking: {
            label: '组织能力',
            icon: 'users',
            items: {
                playmaking: '传球视野',
                turnover: '失误控制',
                leadership: '领导力'
            }
        },
        physical: {
            label: '身体状态',
            icon: 'zap',
            items: {
                durability: '耐操性',
                athleticism: '运动能力',
                stamina: '比赛强度'
            }
        },
        bbiq: {
            label: '篮球智商',
            icon: 'brain',
            items: {
                basketballIQ: '战术执行',
                decisionMaking: '决策能力',
                impact: '比赛影响力'
            }
        }
    };

    function calculateOverallScore(player) {
        const r = player.ratings;
        const offenseScore = (r.scoring * 0.25 + r.efficiency * 0.20 + r.ballHandling * 0.20 + r.offBall * 0.15 + r.clutch * 0.20) / 100;
        const defenseScore = (r.defense * 0.30 + r.perimeter * 0.15 + r.interior * 0.15 + r.rebounding * 0.20 + r.blocks * 0.20) / 100;
        const playmakingScore = (r.playmaking * 0.40 + (100 - r.turnover) * 0.20 + r.leadership * 0.40) / 100;
        const physicalScore = (r.durability * 0.30 + r.athleticism * 0.40 + r.stamina * 0.30) / 100;
        const bbiqScore = (r.basketballIQ * 0.35 + r.decisionMaking * 0.35 + r.impact * 0.30) / 100;

        return Math.round((offenseScore * weights.offense + defenseScore * weights.defense + playmakingScore * weights.playmaking + physicalScore * weights.physical + bbiqScore * weights.bbiq) * 100 * 10) / 10;
    }

    function getCategoryScore(player, category) {
        const r = player.ratings;
        switch(category) {
            case 'offense':
                return Math.round((r.scoring * 0.25 + r.efficiency * 0.20 + r.ballHandling * 0.20 + r.offBall * 0.15 + r.clutch * 0.20) * 10) / 10;
            case 'defense':
                return Math.round((r.defense * 0.30 + r.perimeter * 0.15 + r.interior * 0.15 + r.rebounding * 0.20 + r.blocks * 0.20) * 10) / 10;
            case 'playmaking':
                return Math.round((r.playmaking * 0.40 + (100 - r.turnover) * 0.20 + r.leadership * 0.40) * 10) / 10;
            case 'physical':
                return Math.round((r.durability * 0.30 + r.athleticism * 0.40 + r.stamina * 0.30) * 10) / 10;
            case 'bbiq':
                return Math.round((r.basketballIQ * 0.35 + r.decisionMaking * 0.35 + r.impact * 0.30) * 10) / 10;
            default:
                return 0;
        }
    }

    function sortPlayers() {
        const sortBy = document.getElementById('filter-sort').value;
        filteredPlayers.sort((a, b) => {
            if (sortBy === 'overall') {
                return calculateOverallScore(b) - calculateOverallScore(a);
            } else {
                return getCategoryScore(b, sortBy) - getCategoryScore(a, sortBy);
            }
        });
    }

    function filterPlayers() {
        const positionFilter = document.getElementById('filter-position').value;
        const teamFilter = document.getElementById('filter-team').value;
        const ageFilter = document.getElementById('filter-age').value;

        filteredPlayers = PLAYERS_DATA.filter(player => {
            if (positionFilter && player.position !== positionFilter) return false;
            if (teamFilter && player.teamAbbr !== teamFilter) return false;
            if (ageFilter) {
                if (ageFilter === 'under25' && player.age >= 25) return false;
                if (ageFilter === '26-30' && (player.age < 26 || player.age > 30)) return false;
                if (ageFilter === 'over31' && player.age <= 31) return false;
            }
            return true;
        });

        if (currentView === 'favorites') {
            filteredPlayers = filteredPlayers.filter(p => favorites.includes(p.id));
        }

        sortPlayers();
        renderPlayerList();
    }

    function renderPlayerList() {
        const listEl = document.getElementById('player-list');
        const emptyEl = document.getElementById('empty-state');

        if (filteredPlayers.length === 0) {
            listEl.innerHTML = '';
            emptyEl.style.display = 'block';
            return;
        }

        emptyEl.style.display = 'none';

        listEl.innerHTML = filteredPlayers.map((player, index) => {
            const overall = calculateOverallScore(player);
            const offense = getCategoryScore(player, 'offense');
            const defense = getCategoryScore(player, 'defense');
            const playmaking = getCategoryScore(player, 'playmaking');
            const rank = index + 1;
            const isFavorite = favorites.includes(player.id);
            const initials = player.name.split(' ').map(n => n[0]).join('').substring(0, 2);

            let rankClass = '';
            if (rank === 1) rankClass = 'rank-1';
            else if (rank === 2) rankClass = 'rank-2';
            else if (rank === 3) rankClass = 'rank-3';

            let medal = '';
            if (rank === 1) medal = '🏆';
            else if (rank === 2) medal = '🥈';
            else if (rank === 3) medal = '🥉';

            return `
                <div class="player-card ${isFavorite ? 'in-favorites' : ''}" data-id="${player.id}" onclick="showPlayerDetail('${player.id}')">
                    <div class="player-rank ${rankClass}">${medal || rank}</div>
                    <div class="player-info">
                        <div class="player-avatar">${initials}</div>
                        <div class="player-details">
                            <h3>${player.name}</h3>
                            <div class="player-meta">
                                <span class="player-team">${player.teamAbbr}</span>
                                <span class="player-position position-${player.position}">${player.position}</span>
                                <span>${player.age}岁</span>
                            </div>
                        </div>
                    </div>
                    <div class="player-stats">
                        <div class="stat-row">
                            <span class="stat-label">进攻</span>
                            <div class="stat-bar"><div class="stat-fill offense" style="width: ${offense}%"></div></div>
                            <span class="stat-value">${offense}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">防守</span>
                            <div class="stat-bar"><div class="stat-fill defense" style="width: ${defense}%"></div></div>
                            <span class="stat-value">${defense}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">组织</span>
                            <div class="stat-bar"><div class="stat-fill playmaking" style="width: ${playmaking}%"></div></div>
                            <span class="stat-value">${playmaking}</span>
                        </div>
                    </div>
                    <div class="player-score">
                        <div class="score-value">${overall}</div>
                        <div class="score-label">综合评分</div>
                    </div>
                    <div class="card-actions" onclick="event.stopPropagation()">
                        <button class="icon-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite('${player.id}')" title="收藏">
                            <i data-lucide="heart"></i>
                        </button>
                        <button class="icon-btn" onclick="addToCompare('${player.id}')" title="对比">
                            <i data-lucide="git-compare"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        lucide.createIcons();
    }

    function populateTeamFilter() {
        const select = document.getElementById('filter-team');
        select.innerHTML = '<option value="">全部球队</option>' +
            TEAMS.map(t => `<option value="${t.abbr}">${t.name}</option>`).join('');
    }

    function showPlayerDetail(playerId) {
        const player = PLAYERS_DATA.find(p => p.id === playerId);
        if (!player) return;

        const overall = calculateOverallScore(player);
        const offense = getCategoryScore(player, 'offense');
        const defense = getCategoryScore(player, 'defense');
        const playmaking = getCategoryScore(player, 'playmaking');
        const physical = getCategoryScore(player, 'physical');
        const bbiq = getCategoryScore(player, 'bbiq');

        document.getElementById('detail-title').textContent = player.name;

        document.getElementById('detail-body').innerHTML = `
            <div class="radar-container">
                <canvas id="radar-canvas" class="radar-chart" width="300" height="300"></canvas>
                <div class="radar-legend">
                    <div class="legend-item">
                        <div class="legend-label">进攻能力</div>
                        <div class="legend-value offense">${offense}</div>
                    </div>
                    <div class="legend-item">
                        <div class="legend-label">防守能力</div>
                        <div class="legend-value defense">${defense}</div>
                    </div>
                    <div class="legend-item">
                        <div class="legend-label">组织能力</div>
                        <div class="legend-value playmaking">${playmaking}</div>
                    </div>
                    <div class="legend-item">
                        <div class="legend-label">身体状态</div>
                        <div class="legend-value physical">${physical}</div>
                    </div>
                    <div class="legend-item">
                        <div class="legend-label">篮球智商</div>
                        <div class="legend-value bbiq">${bbiq}</div>
                    </div>
                    <div class="legend-item">
                        <div class="legend-label">综合评分</div>
                        <div class="legend-value" style="color: var(--accent-primary); font-size: 32px;">${overall}</div>
                    </div>
                </div>
            </div>
            <div style="margin-top: 30px;">
                <h4 style="margin-bottom: 16px; color: var(--text-secondary);">详细信息</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
                    <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 8px;">
                        <div style="color: var(--text-muted); font-size: 12px;">球队</div>
                        <div style="font-weight: 600;">${player.team}</div>
                    </div>
                    <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 8px;">
                        <div style="color: var(--text-muted); font-size: 12px;">位置</div>
                        <div style="font-weight: 600;">${player.position} - ${POSITION_NAMES[player.position]}</div>
                    </div>
                    <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 8px;">
                        <div style="color: var(--text-muted); font-size: 12px;">年龄</div>
                        <div style="font-weight: 600;">${player.age}岁</div>
                    </div>
                    <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 8px;">
                        <div style="color: var(--text-muted); font-size: 12px;">身高/体重</div>
                        <div style="font-weight: 600;">${player.height}cm / ${player.weight}kg</div>
                    </div>
                    <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 8px;">
                        <div style="color: var(--text-muted); font-size: 12px;">球龄</div>
                        <div style="font-weight: 600;">${player.experience}年</div>
                    </div>
                    <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 8px;">
                        <div style="color: var(--text-muted); font-size: 12px;">球衣号码</div>
                        <div style="font-weight: 600;">#${player.number}</div>
                    </div>
                </div>
            </div>
            <div style="margin-top: 24px;">
                <h4 style="margin-bottom: 16px; color: var(--text-secondary);">生涯荣誉</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${player.honors.map(h => `<span style="background: var(--bg-tertiary); padding: 8px 16px; border-radius: 20px; font-size: 13px;">${h}</span>`).join('')}
                </div>
            </div>
            <div style="margin-top: 24px;">
                <h4 style="margin-bottom: 16px; color: var(--text-secondary);">进阶数据</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px;">
                    <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="color: var(--text-muted); font-size: 11px;">PER</div>
                        <div style="font-family: 'Orbitron', sans-serif; font-size: 20px; font-weight: 700; color: var(--accent-primary);">${player.advanced.per}</div>
                    </div>
                    <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="color: var(--text-muted); font-size: 11px;">WS</div>
                        <div style="font-family: 'Orbitron', sans-serif; font-size: 20px; font-weight: 700; color: var(--accent-primary);">${player.advanced.ws}</div>
                    </div>
                    <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="color: var(--text-muted); font-size: 11px;">BPM</div>
                        <div style="font-family: 'Orbitron', sans-serif; font-size: 20px; font-weight: 700; color: var(--accent-primary);">${player.advanced.bpm}</div>
                    </div>
                    <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="color: var(--text-muted); font-size: 11px;">VORP</div>
                        <div style="font-family: 'Orbitron', sans-serif; font-size: 20px; font-weight: 700; color: var(--accent-primary);">${player.advanced.vorp}</div>
                    </div>
                    <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="color: var(--text-muted); font-size: 11px;">真实命中率</div>
                        <div style="font-family: 'Orbitron', sans-serif; font-size: 20px; font-weight: 700; color: var(--accent-success);">${player.advanced.trueShooting}%</div>
                    </div>
                    <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 8px; text-align: center;">
                        <div style="color: var(--text-muted); font-size: 11px;">使用率</div>
                        <div style="font-family: 'Orbitron', sans-serif; font-size: 20px; font-weight: 700; color: var(--accent-warning);">${player.advanced.usage}%</div>
                    </div>
                </div>
            </div>
        `;

        openModal('detail-modal');

        setTimeout(() => {
            drawRadarChart(player);
        }, 100);
    }

    function drawRadarChart(player) {
        const canvas = document.getElementById('radar-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const centerX = 150;
        const centerY = 150;
        const maxRadius = 120;

        const categories = ['offense', 'defense', 'playmaking', 'physical', 'bbiq'];
        const values = categories.map(cat => getCategoryScore(player, cat));
        const labels = ['进攻', '防守', '组织', '身体', '智商'];

        ctx.clearRect(0, 0, 300, 300);

        ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
        ctx.lineWidth = 1;
        for (let level = 1; level <= 5; level++) {
            ctx.beginPath();
            for (let i = 0; i <= 5; i++) {
                const angle = (Math.PI * 2 * i / 5) - Math.PI / 2;
                const radius = (maxRadius * level) / 5;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        }

        ctx.strokeStyle = '#2a2a3e';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i / 5) - Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + Math.cos(angle) * maxRadius, centerY + Math.sin(angle) * maxRadius);
            ctx.stroke();
        }

        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 107, 53, 0.1)');

        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i / 5) - Math.PI / 2;
            const radius = (values[i] / 100) * maxRadius;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i / 5) - Math.PI / 2;
            const x = centerX + Math.cos(angle) * (maxRadius + 20);
            const y = centerY + Math.sin(angle) * (maxRadius + 20);
            ctx.fillText(labels[i], x, y + 4);
        }
    }

    function toggleFavorite(playerId) {
        const index = favorites.indexOf(playerId);
        if (index === -1) {
            favorites.push(playerId);
            showToast('已添加到收藏');
        } else {
            favorites.splice(index, 1);
            showToast('已从收藏移除');
        }
        localStorage.setItem('nba-favorites', JSON.stringify(favorites));
        renderPlayerList();
    }

    let compareList = [];

    function addToCompare(playerId) {
        if (compareList.includes(playerId)) {
            showToast('该球员已在对比列表');
            return;
        }
        if (compareList.length >= 4) {
            showToast('最多对比4名球员');
            return;
        }
        compareList.push(playerId);
        showToast(`已添加至对比 (${compareList.length}/4)`);
    }

    function showCompareView() {
        if (compareList.length < 2) {
            showToast('请先添加至少2名球员进行对比');
            return;
        }

        const players = compareList.map(id => PLAYERS_DATA.find(p => p.id === id));

        document.getElementById('compare-body').innerHTML = `
            <div class="comparison-container">
                ${players.map((p, i) => `
                    <div class="comparison-player">
                        <div class="comparison-rank">#${i + 1}</div>
                        <div class="comparison-name">${p.name}</div>
                        <div class="comparison-team">${p.team} | ${p.position}</div>
                        <div class="comparison-score">${calculateOverallScore(p)}</div>
                    </div>
                `).join('')}
            </div>
            <div style="margin-top: 30px;">
                <canvas id="compare-radar" width="600" height="400" style="max-width: 100%;"></canvas>
            </div>
            <div style="margin-top: 30px; display: flex; gap: 12px; justify-content: center;">
                <button class="btn btn-secondary" onclick="clearCompare()">清空对比</button>
                <button class="btn btn-primary" onclick="closeModal('compare-modal')">完成</button>
            </div>
        `;

        openModal('compare-modal');

        setTimeout(() => {
            drawCompareRadar(players);
        }, 100);
    }

    function drawCompareRadar(players) {
        const canvas = document.getElementById('compare-radar');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const centerX = 300;
        const centerY = 200;
        const maxRadius = 150;

        const categories = ['offense', 'defense', 'playmaking', 'physical', 'bbiq'];
        const labels = ['进攻', '防守', '组织', '身体', '智商'];
        const colors = ['#00d4ff', '#ff6b35', '#00ff88', '#ffd93d', '#b388ff'];

        ctx.clearRect(0, 0, 600, 400);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        for (let level = 1; level <= 5; level++) {
            ctx.beginPath();
            for (let i = 0; i <= 5; i++) {
                const angle = (Math.PI * 2 * i / 5) - Math.PI / 2;
                const radius = (maxRadius * level) / 5;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        }

        players.forEach((player, pIndex) => {
            const values = categories.map(cat => getCategoryScore(player, cat));

            ctx.strokeStyle = colors[pIndex];
            ctx.lineWidth = 3;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 * i / 5) - Math.PI / 2;
                const radius = (values[i] / 100) * maxRadius;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        });

        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i / 5) - Math.PI / 2;
            const x = centerX + Math.cos(angle) * (maxRadius + 30);
            const y = centerY + Math.sin(angle) * (maxRadius + 30);
            ctx.fillText(labels[i], x, y + 5);
        }

        ctx.font = '12px Inter';
        players.forEach((p, i) => {
            ctx.fillStyle = colors[i];
            ctx.fillRect(centerX - 200 + i * 100, 380, 12, 12);
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'left';
            ctx.fillText(p.name, centerX - 185 + i * 100, 392);
        });
    }

    function clearCompare() {
        compareList = [];
        closeModal('compare-modal');
        showToast('已清空对比列表');
    }

    let battleState = {
        players: [],
        currentPair: [],
        results: {},
        elo: {},
        currentRound: 0,
        totalRounds: 0,
        queue: []
    };

    function initBattle() {
        const savedElo = localStorage.getItem('nba-battle-elo');
        if (savedElo) {
            battleState.elo = JSON.parse(savedElo);
        } else {
            PLAYERS_DATA.forEach(p => {
                battleState.elo[p.id] = 1500;
            });
        }

        battleState.players = [...PLAYERS_DATA];
        battleState.results = {};
        battleState.queue = shuffleArray([...PLAYERS_DATA]);
        battleState.currentRound = 0;
        battleState.totalRounds = Math.floor(PLAYERS_DATA.length / 2);
        battleState.currentPair = [battleState.queue.pop(), battleState.queue.pop()];

        renderBattleArena();
    }

    function shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function renderBattleArena() {
        if (!battleState.currentPair || battleState.currentPair.length < 2) {
            showBattleResults();
            return;
        }

        const [p1, p2] = battleState.currentPair;
        const elo1 = battleState.elo[p1.id] || 1500;
        const elo2 = battleState.elo[p2.id] || 1500;

        document.getElementById('battle-body').innerHTML = `
            <div class="battle-header">
                <div class="battle-progress">第 ${battleState.currentRound + 1} / ${battleState.totalRounds} 轮</div>
                <div class="battle-instruction">选择你认为更强的球员</div>
            </div>
            <div class="battle-arena">
                <div class="battle-player ${p1.position}" onclick="selectBattleWinner('${p1.id}')">
                    <div class="battle-player-rank">#${Math.round(elo1)}</div>
                    <div class="battle-player-avatar">${p1.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</div>
                    <div class="battle-player-name">${p1.name}</div>
                    <div class="battle-player-info">${p1.team} | ${p1.position}</div>
                    <div class="battle-player-score">评分: ${calculateOverallScore(p1)}</div>
                    <div class="battle-elo">Elo: ${Math.round(elo1)}</div>
                </div>
                <div class="battle-vs">VS</div>
                <div class="battle-player ${p2.position}" onclick="selectBattleWinner('${p2.id}')">
                    <div class="battle-player-rank">#${Math.round(elo2)}</div>
                    <div class="battle-player-avatar">${p2.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</div>
                    <div class="battle-player-name">${p2.name}</div>
                    <div class="battle-player-info">${p2.team} | ${p2.position}</div>
                    <div class="battle-player-score">评分: ${calculateOverallScore(p2)}</div>
                    <div class="battle-elo">Elo: ${Math.round(elo2)}</div>
                </div>
            </div>
            <div class="battle-actions">
                <button class="btn btn-secondary" onclick="resetBattle()">重新开始</button>
                <button class="btn btn-secondary" onclick="skipBattle()">跳过</button>
            </div>
        `;
    }

    function selectBattleWinner(winnerId) {
        const loserId = battleState.currentPair.find(id => id !== winnerId);

        const winnerElo = battleState.elo[winnerId] || 1500;
        const loserElo = battleState.elo[loserId] || 1500;

        const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
        const K = 32;
        battleState.elo[winnerId] = winnerElo + K * (1 - expectedWinner);
        battleState.elo[loserId] = loserElo + K * (0 - (1 - expectedWinner));

        localStorage.setItem('nba-battle-elo', JSON.stringify(battleState.elo));

        battleState.results[winnerId] = (battleState.results[winnerId] || 0) + 1;

        nextBattlePair();
    }

    function nextBattlePair() {
        battleState.currentRound++;

        if (battleState.queue.length >= 2) {
            battleState.currentPair = [battleState.queue.pop(), battleState.queue.pop()];
            renderBattleArena();
        } else {
            showBattleResults();
        }
    }

    function skipBattle() {
        if (battleState.queue.length >= 2) {
            battleState.queue.unshift(battleState.currentPair[0], battleState.currentPair[1]);
            battleState.currentPair = [battleState.queue.pop(), battleState.queue.pop()];
            renderBattleArena();
        } else {
            showBattleResults();
        }
    }

    function showBattleResults() {
        const sortedPlayers = [...PLAYERS_DATA].sort((a, b) => {
            const eloA = battleState.elo[a.id] || 1500;
            const eloB = battleState.elo[b.id] || 1500;
            return eloB - eloA;
        });

        document.getElementById('battle-body').innerHTML = `
            <div class="battle-results-header">
                <h3>🏆 对战排名</h3>
                <p class="battle-results-subtitle">基于你的选择生成的排名</p>
            </div>
            <div class="battle-rankings">
                ${sortedPlayers.map((player, index) => {
                    const elo = Math.round(battleState.elo[player.id] || 1500);
                    const wins = battleState.results[player.id] || 0;
                    let medal = '';
                    if (index === 0) medal = '🥇';
                    else if (index === 1) medal = '🥈';
                    else if (index === 2) medal = '🥉';

                    return `
                        <div class="battle-ranking-item ${index < 3 ? 'top-3' : ''}">
                            <div class="br-rank">${medal || (index + 1)}</div>
                            <div class="br-avatar">${player.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</div>
                            <div class="br-info">
                                <div class="br-name">${player.name}</div>
                                <div class="br-meta">${player.team} | ${player.position}</div>
                            </div>
                            <div class="br-elo">${elo}</div>
                            <div class="br-wins">${wins}胜</div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="battle-actions">
                <button class="btn btn-primary" onclick="closeModal('battle-modal')">完成</button>
                <button class="btn btn-secondary" onclick="resetBattle()">再来一轮</button>
            </div>
        `;
    }

    function resetBattle() {
        initBattle();
    }

    function showBattleView() {
        initBattle();
        openModal('battle-modal');
    }

    function initWeightSliders() {
        const grid = document.getElementById('weight-grid');
        grid.innerHTML = Object.entries(weightCategories).map(([key, cat]) => `
            <div class="weight-category">
                <div class="weight-category-title ${key}">
                    <i data-lucide="${cat.icon}"></i>
                    ${cat.label}
                </div>
                <div class="weight-sliders">
                    ${Object.entries(cat.items).map(([itemKey, itemLabel]) => `
                        <div class="weight-slider-item">
                            <div class="weight-slider-label">
                                <span>${itemLabel}</span>
                                <span>${weights[key] * 100}%</span>
                            </div>
                            <input type="range" class="weight-slider"
                                data-category="${key}"
                                min="0" max="100" value="${weights[key] * 100}">
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.weight-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const category = e.target.dataset.category;
                const value = parseInt(e.target.value);
                weights[category] = value / 100;

                const label = e.target.previousElementSibling.querySelector('span:last-child');
                label.textContent = `${value}%`;

                document.querySelectorAll(`.weight-slider[data-category="${category}"]`).forEach(s => {
                    s.value = value;
                    s.previousElementSibling.querySelector('span:last-child').textContent = `${value}%`;
                });
            });
        });

        lucide.createIcons();
    }

    function applyPreset(presetName) {
        const preset = weightPresets[presetName];
        if (!preset) return;

        weights = { ...preset };

        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.preset === presetName);
        });

        Object.entries(weights).forEach(([key, value]) => {
            document.querySelectorAll(`.weight-slider[data-category="${key}"]`).forEach(slider => {
                slider.value = value * 100;
                slider.dispatchEvent(new Event('input'));
            });
        });
    }

    function resetWeights() {
        weights = { ...weightPresets.balanced };
        document.querySelectorAll('.weight-slider').forEach(slider => {
            const category = slider.dataset.category;
            slider.value = weights[category] * 100;
            slider.dispatchEvent(new Event('input'));
        });
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.preset === 'balanced');
        });
        showToast('已重置为默认权重');
    }

    function applyWeights() {
        const total = Object.values(weights).reduce((a, b) => a + b, 0);
        if (Math.abs(total - 1) > 0.01) {
            showToast('权重总和必须等于100%');
            return;
        }

        closeModal('weight-modal');
        sortPlayers();
        renderPlayerList();
        showToast('权重已应用，排名已更新');
    }

    function openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        document.body.style.overflow = '';
    }

    function showToast(message) {
        const toast = document.getElementById('toast');
        document.getElementById('toast-message').textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }

    function clearFilters() {
        document.getElementById('filter-position').value = '';
        document.getElementById('filter-team').value = '';
        document.getElementById('filter-age').value = '';
        document.getElementById('filter-sort').value = 'overall';
        filterPlayers();
    }

    function setView(view) {
        currentView = view;
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === view);
        });

        if (view === 'favorites') {
            filteredPlayers = PLAYERS_DATA.filter(p => favorites.includes(p.id));
        } else {
            filterPlayers();
        }

        sortPlayers();
        renderPlayerList();
    }

    function init() {
        populateTeamFilter();
        initWeightSliders();
        sortPlayers();
        renderPlayerList();

        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                if (tab.dataset.view === 'battle') {
                    showBattleView();
                } else {
                    setView(tab.dataset.view);
                }
            });
        });

        document.getElementById('filter-position').addEventListener('change', filterPlayers);
        document.getElementById('filter-team').addEventListener('change', filterPlayers);
        document.getElementById('filter-age').addEventListener('change', filterPlayers);
        document.getElementById('filter-sort').addEventListener('change', () => {
            sortPlayers();
            renderPlayerList();
        });

        document.getElementById('btn-weights').addEventListener('click', () => openModal('weight-modal'));
        document.getElementById('btn-compare').addEventListener('click', showCompareView);

        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
        });

        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });

        lucide.createIcons();
    }

    document.addEventListener('DOMContentLoaded', init);
    window.showPlayerDetail = showPlayerDetail;
    window.toggleFavorite = toggleFavorite;
    window.addToCompare = addToCompare;
    window.clearCompare = clearCompare;
    window.closeModal = closeModal;
    window.resetWeights = resetWeights;
    window.applyWeights = applyWeights;
    window.clearFilters = clearFilters;
    window.selectBattleWinner = selectBattleWinner;
    window.skipBattle = skipBattle;
    window.resetBattle = resetBattle;
})();
