
let currentSubject = null;
let answerCount = 0;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const subject = urlParams.get('subject');
    
    if (subject) {
        currentSubject = subject;
        document.getElementById('subjectTitle').textContent = `${subject.toUpperCase()} 练习`;
        loadQuestion(subject);
    }
});

function loadNewQuestion() {
    loadQuestion(currentSubject);
    document.getElementById('userAnswer').value = ''; // 清空之前的回答
    document.getElementById('answer').style.display = 'none'; // 隐藏答案
}

async function loadQuestion(subject) {
    try {
        const response = await fetch(`/api/question?subject=${subject}`);
        const data = await response.json();
        
        if (data.error) {
            alert(data.error);
            return;
        }
        
        document.getElementById('questionText').textContent = data.q;
        document.getElementById('correctAnswer').textContent = data.a;
    } catch (error) {
        console.error('Error:', error);
    }
}

function toggleAnswer() {
    const answerDiv = document.getElementById('answer');
    answerDiv.style.display = answerDiv.style.display === 'none' ? 'block' : 'none';
}

async function submitAnswer() {
    const userAnswerInput = document.getElementById('userAnswer');
    const messageElement = document.getElementById('submitMessage');
    const questionText = document.getElementById('questionText').textContent;
    const correctAnswer = document.getElementById('correctAnswer').textContent;
    
    // 清除旧消息样式
    messageElement.classList.remove('success', 'error', 'show');    // messageElement.style.display = 'none';

    // 输入验证
    if (!userAnswerInput.value.trim()) {
        messageElement.textContent = "⚠️ 请输入答案后再提交";
        messageElement.classList.add('error', 'show');
        return;
    }

    try {
        // 发送提交请求
        const response = await fetch('/api/answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: questionText,
                userAnswer: userAnswerInput.value,
                correctAnswer: correctAnswer
            })
        });

        // 处理响应
        if (response.ok) {
            // 更新界面
            userAnswerInput.value = '';
            
            // 显示成功消息
            messageElement.textContent = "✓ 答案已成功提交";
            messageElement.classList.add('success', 'show');
            
            // 更新答题计数
            const counter = document.getElementById('answeredCount');
            counter.textContent = parseInt(counter.textContent) + 1;

            // 自动隐藏消息
            setTimeout(() => {
                messageElement.classList.remove('show');
            }, 2000);
        } else {
            throw new Error('提交失败');
        }
    } catch (error) {
        // 错误处理
        console.error('提交错误:', error);
        messageElement.textContent = "⚠️ 提交失败，请稍后重试";
        messageElement.classList.add('error', 'show');
        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 3000);
    }
}