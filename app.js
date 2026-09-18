// 应用状态管理
class VocabularyApp {
    constructor() {
        this.currentBook = 'cet6';
        this.wordsPerGroup = 10;
        this.learningWords = [];
        this.reviewWords = [];
        this.masteredWords = [];
        this.currentStudyGroup = [];
        this.currentWordIndex = 0;
        this.currentRound = 1;
        this.round1Results = {};
        this.round2Results = {};
        this.studyMode = 'learning';
        this.checkinDates = new Set();
        this.dailyStats = {};
        this.chart = null;

        this.loadData();
        this.initEventListeners();
        this.renderMain();
        this.initChart();
    }

    // 加载保存的数据
    loadData() {
        const saved = localStorage.getItem('vocabularyApp');
        if (saved) {
            const data = JSON.parse(saved);
            this.currentBook = data.currentBook || 'cet6';
            this.wordsPerGroup = data.wordsPerGroup || 10;
            this.masteredWords = data.masteredWords || [];
            this.reviewWords = data.reviewWords || [];
            this.checkinDates = new Set(data.checkinDates || []);
            this.dailyStats = data.dailyStats || {};
        }

        this.updateLearningWords();
    }

    // 保存数据
    saveData() {
        const data = {
            currentBook: this.currentBook,
            wordsPerGroup: this.wordsPerGroup,
            masteredWords: this.masteredWords,
            reviewWords: this.reviewWords,
            checkinDates: Array.from(this.checkinDates),
            dailyStats: this.dailyStats
        };
        localStorage.setItem('vocabularyApp', JSON.stringify(data));
    }

    // 更新学习单词列表
    updateLearningWords() {
        const allWords = this.currentBook === 'cet6' ? CET6_VOCABULARY : KAOYAN_VOCABULARY;
        const masteredIds = new Set(this.masteredWords.map(w => w.word));
        const reviewIds = new Set(this.reviewWords.map(w => w.word));

        this.learningWords = allWords
            .filter(w => !masteredIds.has(w.word) && !reviewIds.has(w.word))
            .sort((a, b) => b.frequency - a.frequency);
    }

    // 初始化事件监听
    initEventListeners() {
        // 主题切换
        document.getElementById('theme-toggle').addEventListener('click', () => {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            html.setAttribute('data-theme', newTheme);
            const icon = document.querySelector('.theme-icon');
            icon.textContent = newTheme === 'light' ? '☀️' : '🌙';
            localStorage.setItem('theme', newTheme);
        });

        // 加载保存的主题
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.querySelector('.theme-icon').textContent = savedTheme === 'light' ? '☀️' : '🌙';

        // 词书切换
        document.getElementById('book-select').addEventListener('change', (e) => {
            this.currentBook = e.target.value;
            this.updateLearningWords();
            this.saveData();
            this.renderMain();
        });

        // 设置按钮
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showView('settings-view');
            document.getElementById('words-per-group').value = this.wordsPerGroup;
        });

        // 每组单词数设置
        document.getElementById('words-per-group').addEventListener('change', (e) => {
            this.wordsPerGroup = parseInt(e.target.value);
            this.saveData();
        });

        // 签到按钮
        document.getElementById('checkin-btn').addEventListener('click', () => {
            this.checkin();
        });

        // 模块按钮
        document.querySelectorAll('.module-card').forEach(card => {
            card.querySelector('.module-btn').addEventListener('click', () => {
                const module = card.dataset.module;
                this.handleModuleClick(module);
            });
        });

        // 返回按钮
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showView('main-view');
                this.renderMain();
            });
        });
    }

    // 签到功能
    checkin() {
        const today = new Date().toISOString().split('T')[0];
        if (!this.checkinDates.has(today)) {
            this.checkinDates.add(today);
            this.saveData();
            this.renderMain();

            const btn = document.getElementById('checkin-btn');
            btn.classList.add('checked');
            btn.querySelector('.checkin-text').textContent = '已签到';
        }
    }

    // 处理模块点击
    handleModuleClick(module) {
        if (module === 'learning') {
            if (this.learningWords.length === 0) {
                alert('没有可学习的单词了！');
                return;
            }
            this.studyMode = 'learning';
            this.startStudy();
        } else if (module === 'review') {
            const needReview = this.getWordsNeedReview();
            if (needReview.length === 0) {
                alert('暂无需要复习的单词！');
                return;
            }
            this.studyMode = 'review';
            this.startStudy();
        } else if (module === 'mastered') {
            this.showMasteredWords();
        }
    }

    // 开始学习
    startStudy() {
        if (this.studyMode === 'learning') {
            this.currentStudyGroup = this.learningWords.slice(0, this.wordsPerGroup);
        } else {
            this.currentStudyGroup = this.getWordsNeedReview().slice(0, this.wordsPerGroup);
        }

        if (this.currentStudyGroup.length === 0) {
            alert('没有可学习的单词！');
            return;
        }

        this.currentWordIndex = 0;
        this.currentRound = 1;
        this.round1Results = {};
        this.round2Results = {};

        this.showView('study-view');
        this.renderRound1();
    }

    // 第一轮：英文选中文
    renderRound1() {
        document.getElementById('round1').classList.remove('hidden');
        document.getElementById('round2').classList.add('hidden');
        document.getElementById('round3').classList.add('hidden');

        const word = this.currentStudyGroup[this.currentWordIndex];
        document.getElementById('word-en').textContent = word.word;

        const options = this.generateOptions(word, 'meaning');
        const container = document.getElementById('options1');
        container.innerHTML = '';

        options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = option;
            btn.addEventListener('click', () => {
                this.handleRound1Answer(btn, option === word.meaning);
            });
            container.appendChild(btn);
        });

        this.updateProgress();
    }

    // 处理第一轮答案
    handleRound1Answer(btn, isCorrect) {
        const word = this.currentStudyGroup[this.currentWordIndex];
        this.round1Results[word.word] = isCorrect;

        btn.classList.add(isCorrect ? 'correct' : 'wrong');

        // 禁用所有按钮
        document.querySelectorAll('#options1 .option-btn').forEach(b => {
            b.disabled = true;
            if (b.textContent === word.meaning && !isCorrect) {
                b.classList.add('correct');
            }
        });

        setTimeout(() => {
            this.currentWordIndex++;
            if (this.currentWordIndex < this.currentStudyGroup.length) {
                this.renderRound1();
            } else {
                this.currentWordIndex = 0;
                this.currentRound = 2;
                this.renderRound2();
            }
        }, 1000);
    }

    // 第二轮：中文选英文
    renderRound2() {
        document.getElementById('round1').classList.add('hidden');
        document.getElementById('round2').classList.remove('hidden');
        document.getElementById('round3').classList.add('hidden');

        const word = this.currentStudyGroup[this.currentWordIndex];
        document.getElementById('word-cn').textContent = word.meaning;

        const options = this.generateOptions(word, 'word');
        const container = document.getElementById('options2');
        container.innerHTML = '';

        options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = option;
            btn.addEventListener('click', () => {
                this.handleRound2Answer(btn, option === word.word);
            });
            container.appendChild(btn);
        });

        this.updateProgress();
    }

    // 处理第二轮答案
    handleRound2Answer(btn, isCorrect) {
        const word = this.currentStudyGroup[this.currentWordIndex];
        this.round2Results[word.word] = isCorrect;

        btn.classList.add(isCorrect ? 'correct' : 'wrong');

        document.querySelectorAll('#options2 .option-btn').forEach(b => {
            b.disabled = true;
            if (b.textContent === word.word && !isCorrect) {
                b.classList.add('correct');
            }
        });

        setTimeout(() => {
            this.currentWordIndex++;
            if (this.currentWordIndex < this.currentStudyGroup.length) {
                this.renderRound2();
            } else {
                this.currentWordIndex = 0;
                this.currentRound = 3;
                this.renderRound3();
            }
        }, 1000);
    }

    // 第三轮：拼写
    renderRound3() {
        document.getElementById('round1').classList.add('hidden');
        document.getElementById('round2').classList.add('hidden');
        document.getElementById('round3').classList.remove('hidden');

        const word = this.currentStudyGroup[this.currentWordIndex];
        document.getElementById('word-cn-spell').textContent = word.meaning;

        const input = document.getElementById('spell-input');
        input.value = '';
        input.disabled = false;
        input.focus();

        const feedback = document.getElementById('spell-feedback');
        feedback.textContent = '';
        feedback.className = 'spell-feedback';

        const submitBtn = document.getElementById('submit-spell');
        submitBtn.onclick = () => this.handleRound3Answer();

        input.onkeypress = (e) => {
            if (e.key === 'Enter') {
                this.handleRound3Answer();
            }
        };

        this.updateProgress();
    }

    // 处理第三轮答案
    handleRound3Answer() {
        const word = this.currentStudyGroup[this.currentWordIndex];
        const input = document.getElementById('spell-input');
        const userAnswer = input.value.trim().toLowerCase();
        const isCorrect = userAnswer === word.word.toLowerCase();

        const feedback = document.getElementById('spell-feedback');
        if (isCorrect) {
            feedback.textContent = '✓ 正确！';
            feedback.className = 'spell-feedback correct';
        } else {
            feedback.textContent = `✗ 错误！正确答案是：${word.word}`;
            feedback.className = 'spell-feedback wrong';
        }

        input.disabled = true;

        setTimeout(() => {
            // 判断单词是否掌握
            const r1 = this.round1Results[word.word];
            const r2 = this.round2Results[word.word];
            const r3 = isCorrect;

            if (this.studyMode === 'learning') {
                // 学习模式：新单词
                if (r1 && r2 && r3) {
                    // 三轮都正确，加入已学完
                    this.masteredWords.push({
                        ...word,
                        masteredDate: new Date().toISOString()
                    });
                } else {
                    // 有错误，加入复习
                    this.reviewWords.push({
                        ...word,
                        nextReview: this.calculateNextReview(0),
                        reviewCount: 0,
                        lastReview: new Date().toISOString()
                    });
                }
            } else {
                // 复习模式：更新现有单词
                const existingIndex = this.reviewWords.findIndex(w => w.word === word.word);

                if (r1 && r2 && r3) {
                    // 三轮都正确
                    if (existingIndex !== -1) {
                        const reviewWord = this.reviewWords[existingIndex];
                        reviewWord.reviewCount++;
                        reviewWord.lastReview = new Date().toISOString();
                        reviewWord.nextReview = this.calculateNextReview(reviewWord.reviewCount);

                        // 如果复习次数达到6次，移入已学完
                        if (reviewWord.reviewCount >= 6) {
                            this.reviewWords.splice(existingIndex, 1);
                            this.masteredWords.push({
                                ...word,
                                masteredDate: new Date().toISOString()
                            });
                        }
                    }
                } else {
                    // 有错误，重置复习计数
                    if (existingIndex !== -1) {
                        this.reviewWords[existingIndex].reviewCount = 0;
                        this.reviewWords[existingIndex].lastReview = new Date().toISOString();
                        this.reviewWords[existingIndex].nextReview = this.calculateNextReview(0);
                    }
                }
            }

            this.currentWordIndex++;
            if (this.currentWordIndex < this.currentStudyGroup.length) {
                this.renderRound3();
            } else {
                this.finishStudy();
            }
        }, 2000);
    }

    // 完成学习
    finishStudy() {
        // 更新每日统计
        const today = new Date().toISOString().split('T')[0];
        if (!this.dailyStats[today]) {
            this.dailyStats[today] = { learned: 0, reviewed: 0 };
        }

        if (this.studyMode === 'learning') {
            this.dailyStats[today].learned += this.currentStudyGroup.length;
        } else {
            this.dailyStats[today].reviewed += this.currentStudyGroup.length;
        }

        this.updateLearningWords();
        this.saveData();
        this.showView('main-view');
        this.renderMain();
        this.updateChart();

        alert(`完成学习！\n已掌握：${Object.values(this.round1Results).filter(v => v).length} 个\n需复习：${Object.values(this.round1Results).filter(v => !v).length} 个`);
    }

    // 生成选项
    generateOptions(correctWord, field) {
        const allWords = this.currentBook === 'cet6' ? CET6_VOCABULARY : KAOYAN_VOCABULARY;
        const options = [correctWord[field]];

        // 生成3个易混淆的错误选项
        const candidates = allWords.filter(w => w.word !== correctWord.word);
        const shuffled = candidates.sort(() => 0.5 - Math.random());

        for (let i = 0; i < 3 && i < shuffled.length; i++) {
            options.push(shuffled[i][field]);
        }

        return options.sort(() => 0.5 - Math.random());
    }

    // 计算下次复习时间（艾宾浩斯曲线）
    calculateNextReview(reviewCount) {
        const intervals = [0, 1, 2, 4, 7, 15, 30]; // 天数，第一次立即复习
        const days = intervals[Math.min(reviewCount, intervals.length - 1)];
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + days);
        return nextDate.toISOString();
    }

    // 获取需要复习的单词
    getWordsNeedReview() {
        const now = new Date().toISOString();
        return this.reviewWords.filter(w => w.nextReview <= now);
    }

    // 更新进度显示
    updateProgress() {
        const total = this.currentStudyGroup.length * 3;
        const current = (this.currentRound - 1) * this.currentStudyGroup.length + this.currentWordIndex + 1;
        const percentage = (current / total) * 100;

        document.getElementById('progress-bar').style.width = `${percentage}%`;
        document.getElementById('progress-text').textContent =
            `${current}/${total} (第${this.currentRound}轮)`;
    }

    // 显示已学完单词
    showMasteredWords() {
        this.showView('mastered-view');
        const list = document.getElementById('mastered-list');
        list.innerHTML = '';

        if (this.masteredWords.length === 0) {
            list.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 2rem;">暂无已学完的单词</div>';
            return;
        }

        this.masteredWords.forEach(word => {
            const item = document.createElement('div');
            item.className = 'word-item';
            item.innerHTML = `
                <div class="word-item-en">${word.word}</div>
                <div class="word-item-cn">${word.meaning}</div>
            `;
            list.appendChild(item);
        });
    }

    // 渲染主界面
    renderMain() {
        // 更新词书选择
        document.getElementById('book-select').value = this.currentBook;

        // 更新模块计数
        document.getElementById('learning-count').textContent = this.learningWords.length;
        document.getElementById('review-count').textContent = this.getWordsNeedReview().length;

        const totalWords = (this.currentBook === 'cet6' ? CET6_VOCABULARY : KAOYAN_VOCABULARY).length;
        document.getElementById('mastered-progress').textContent =
            `${this.masteredWords.length}/${totalWords}`;

        // 更新签到状态
        const today = new Date().toISOString().split('T')[0];
        const btn = document.getElementById('checkin-btn');
        if (this.checkinDates.has(today)) {
            btn.classList.add('checked');
            btn.querySelector('.checkin-text').textContent = '已签到';
        } else {
            btn.classList.remove('checked');
            btn.querySelector('.checkin-text').textContent = '今日签到';
        }

        // 更新连续签到天数
        document.getElementById('streak-days').textContent = this.getStreakDays();

        // 渲染日历
        this.renderCalendar();
    }

    // 获取连续签到天数
    getStreakDays() {
        if (this.checkinDates.size === 0) return 0;

        const dates = Array.from(this.checkinDates).sort().reverse();
        let streak = 0;
        const today = new Date();

        for (let i = 0; i < dates.length; i++) {
            const checkDate = new Date(dates[i]);
            const expectedDate = new Date(today);
            expectedDate.setDate(today.getDate() - i);

            if (checkDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    // 渲染日历
    renderCalendar() {
        const grid = document.getElementById('calendar-grid');
        grid.innerHTML = '';

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);

        // 添加空白天数
        for (let i = 0; i < firstDay.getDay(); i++) {
            const empty = document.createElement('div');
            empty.className = 'calendar-day';
            grid.appendChild(empty);
        }

        // 添加日期
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dateStr = date.toISOString().split('T')[0];
            const todayStr = today.toISOString().split('T')[0];

            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = day;

            if (this.checkinDates.has(dateStr)) {
                dayEl.classList.add('checked');
            }
            if (dateStr === todayStr) {
                dayEl.classList.add('today');
            }

            grid.appendChild(dayEl);
        }
    }

    // 初始化图表
    initChart() {
        const ctx = document.getElementById('stats-chart').getContext('2d');

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: '学习',
                        data: [],
                        backgroundColor: 'rgba(56, 189, 248, 0.8)',
                        borderRadius: 8
                    },
                    {
                        label: '复习',
                        data: [],
                        backgroundColor: 'rgba(110, 231, 183, 0.8)',
                        borderRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2.5,
                plugins: {
                    legend: {
                        labels: {
                            color: getComputedStyle(document.documentElement)
                                .getPropertyValue('--text-primary').trim(),
                            font: {
                                size: 14
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: '最近7天学习统计',
                        color: getComputedStyle(document.documentElement)
                            .getPropertyValue('--text-primary').trim(),
                        font: {
                            size: 18,
                            weight: 600
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: getComputedStyle(document.documentElement)
                                .getPropertyValue('--text-secondary').trim(),
                            stepSize: 10,
                            font: {
                                size: 14
                            }
                        },
                        grid: {
                            color: getComputedStyle(document.documentElement)
                                .getPropertyValue('--surface-3').trim()
                        }
                    },
                    x: {
                        ticks: {
                            color: getComputedStyle(document.documentElement)
                                .getPropertyValue('--text-secondary').trim(),
                            font: {
                                size: 14
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        this.updateChart();
    }

    // 更新图表
    updateChart() {
        const labels = [];
        const learnedData = [];
        const reviewedData = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            labels.push(`${date.getMonth() + 1}/${date.getDate()}`);

            const stats = this.dailyStats[dateStr] || { learned: 0, reviewed: 0 };
            learnedData.push(stats.learned);
            reviewedData.push(stats.reviewed);
        }

        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = learnedData;
        this.chart.data.datasets[1].data = reviewedData;
        this.chart.update();
    }

    // 显示视图
    showView(viewId) {
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(viewId).classList.add('active');
    }
}

// 初始化应用
const app = new VocabularyApp();