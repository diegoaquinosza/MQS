// DADOS FIXOS (Simulação do Banco de Dados)
const scheduleData = [
    {
        day: "Segunda",
        items: [
            { type: 'class', timeStart: '07:30', timeEnd: '09:00', subject: 'Fund Proj b de Dados', room: 'LABDES', prof: 'Liliane Felix' },
            { type: 'interval', timeStart: '09:00', timeEnd: '09:15', label: 'INTERVALO' },
            { type: 'class', timeStart: '09:15', timeEnd: '10:45', subject: 'Fund Proj b de Dados', room: 'LABDES', prof: 'Liliane Felix' }
        ]
    },
    {
        day: "Terça",
        items: [
            { type: 'class', timeStart: '07:30', timeEnd: '09:00', subject: 'Fund Proj b de Dados', room: 'LABDES', prof: 'Liliane Felix' },
            { type: 'interval', timeStart: '09:00', timeEnd: '09:15', label: 'INTERVALO' },
            { type: 'class', timeStart: '09:15', timeEnd: '10:45', subject: 'Fund Proj b de Dados', room: 'LABDES', prof: 'Liliane Felix' }
        ]
    },
    {
        day: "Quarta",
        items: [
            { type: 'class', timeStart: '07:30', timeEnd: '09:00', subject: 'Fund Proj b de Dados', room: 'LABDES', prof: 'Liliane Felix' },
            { type: 'interval', timeStart: '09:00', timeEnd: '09:15', label: 'INTERVALO' },
            { type: 'class', timeStart: '09:15', timeEnd: '10:45', subject: 'Fund Proj b de Dados', room: 'LABDES', prof: 'Liliane Felix' }
        ]
    },
    {
        day: "Quinta",
        items: [
            { type: 'class', timeStart: '07:30', timeEnd: '09:00', subject: 'Fund Proj b de Dados', room: 'LABDES', prof: 'Liliane Felix' },
            { type: 'interval', timeStart: '09:00', timeEnd: '09:15', label: 'INTERVALO' },
            { type: 'class', timeStart: '09:15', timeEnd: '10:45', subject: 'Fund Proj b de Dados', room: 'LABDES', prof: 'Liliane Felix' }
        ]
    },
    {
        day: "Sexta",
        items: [
            { type: 'class', timeStart: '07:30', timeEnd: '09:00', subject: 'Fund Proj b de Dados', room: 'LABDES', prof: 'Liliane Felix' },
            { type: 'interval', timeStart: '09:00', timeEnd: '09:15', label: 'INTERVALO' },
            { type: 'class', timeStart: '09:15', timeEnd: '10:45', subject: 'Fund Proj b de Dados', room: 'LABDES', prof: 'Liliane Felix' }
        ]
    }
];

document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENTOS ---
    const scheduleView = document.getElementById('schedule-view');
    const toggleBtn = document.getElementById('btn-toggle-view');
    const shareBtn = document.getElementById('btn-share');
    const searchBtn = document.getElementById('btn-search');
    
    // Elementos de Texto do Cabeçalho
    const displayCourse = document.getElementById('display-course');
    const displayPeriod = document.getElementById('display-period');

    // =========================================================
    // 1. INTEGRAÇÃO COM A HOME (Ler LocalStorage)
    // =========================================================
    const savedData = localStorage.getItem('mqs_user_data');

    if (savedData) {
        // Se tem dados salvos, aplica na tela
        const userContext = JSON.parse(savedData);
        
        // Atualiza Título do Curso
        displayCourse.textContent = userContext.course;
        
        // Atualiza Subtítulo (Ex: 2º Período • Noturno)
        const shiftDisplay = userContext.shift.charAt(0).toUpperCase() + userContext.shift.slice(1);
        displayPeriod.textContent = `${userContext.period}º Período • ${shiftDisplay}`;
        
    } else {
        // Se NÃO tem dados (acesso direto indevido), volta pra Home
        // Comentado para facilitar seus testes, mas num app real seria ativo:
        // window.location.href = 'index.html';
    }

    // =========================================================
    // 2. RENDERIZAÇÃO
    // =========================================================
    function renderSchedule() {
        const currentDay = new Date().getDay(); 
        const todayIndex = (currentDay >= 1 && currentDay <= 5) ? currentDay - 1 : -1;

        scheduleView.innerHTML = scheduleData.map((data, index) => `
            <article class="day-card ${index === todayIndex ? 'is-today' : ''}">
                <div class="day-card__title">${data.day}</div>
                <div class="classes-list">
                    ${data.items.map(item => {
                        if (item.type === 'interval') {
                            return `
                            <div class="interval-pill">
                                <span>${item.timeStart}</span>
                                <span>${item.label}</span>
                                <span>${item.timeEnd}</span>
                            </div>`;
                        } else {
                            return `
                            <div class="class-item">
                                <p class="class-item__subject">${item.subject}</p>
                                <div class="class-item__details">
                                    <span>${item.timeStart}</span>
                                    <span class="class-item__room">${item.room}</span>
                                    <span>${item.timeEnd}</span>
                                </div>
                                <p class="class-item__prof">${item.prof}</p>
                            </div>`;
                        }
                    }).join('')}
                </div>
            </article>
        `).join('');
    }

    // 3. Toggle View (Horizontal/Vertical)
    toggleBtn.addEventListener('click', () => {
        scheduleView.classList.toggle('schedule-view--horizontal');
        const icon = document.getElementById('toggle-icon');
        icon.textContent = scheduleView.classList.contains('schedule-view--horizontal') ? 'view_agenda' : 'view_week';
    });

    // 4. Botão Nova Busca / Voltar
    searchBtn.addEventListener('click', () => {
        // Tenta voltar para a página anterior (Home)
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // Fallback seguro
            window.location.href = 'index.html';
        }
    });

    // 5. Compartilhar (Screenshot)
    shareBtn.addEventListener('click', async () => {
        const dock = document.querySelector('.floating-dock');
        dock.style.display = 'none'; // Esconde o dock na foto
        try {
            const canvas = await html2canvas(document.getElementById("app-viewport"), {
                backgroundColor: "#F0F4F8", scale: 2
            });
            canvas.toBlob(blob => {
                const file = new File([blob], "grade_mqs.png", { type: "image/png" });
                
                if (navigator.share) {
                    navigator.share({ 
                        files: [file], 
                        title: 'Minha Grade MQS',
                        text: 'Confira minha grade de horários!'
                    });
                } else {
                    const link = document.createElement('a');
                    link.download = 'grade_mqs.png';
                    link.href = URL.createObjectURL(blob);
                    link.click();
                }
            });
        } catch (e) { console.error(e); }
        finally { dock.style.display = 'flex'; }
    });

    renderSchedule();
});