const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// 获取随机问题
app.get('/api/question', (req, res) => {
    const subject = req.query.subject;
    const filePath = path.join(__dirname, 'database', `${subject}.txt`);
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: '科目不存在' });
        
        try {
            const questions = JSON.parse(data);
            const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
            res.json(randomQuestion);
        } catch (e) {
            res.status(500).json({ error: '题库解析失败' });
        }
    });
});

// 提交答案
app.post('/api/answer', (req, res) => {
    const { question, userAnswer, correctAnswer } = req.body;
    const logEntry = `题目: ${question}\n用户答案: ${userAnswer}\n标准答案: ${correctAnswer}\n\n`;
    
    fs.appendFile(path.join(__dirname, 'database/answers.txt'), logEntry, (err) => {
        if (err) return res.status(500).json({ error: '答案保存失败' });
        res.json({ success: true });
    });
});


app.get('/api/subjects', (req, res) => {
    fs.readdir(path.join(__dirname, 'database'), (err, files) => {
        if (err) return res.status(500).json({ error: '无法读取科目列表' });
        
        const subjects = files
            .filter(file => file.endsWith('.txt') && file !== 'answers.txt')
            .map(file => file.replace('.txt', ''));
        
        res.json(subjects);
    });
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});