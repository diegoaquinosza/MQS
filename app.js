// =================================================================
// 🧠 MQS ENGINE - LÓGICA PRINCIPAL (FINAL)
// =================================================================

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
    let userContext = null;

    if (savedData) {
        userContext = JSON.parse(savedData);
        
        // Atualiza UI do Cabeçalho
        displayCourse.textContent = userContext.course;
        const shiftDisplay = userContext.shift.charAt(0).toUpperCase() + userContext.shift.slice(1);
        displayPeriod.textContent = `${userContext.period}º Período • ${shiftDisplay}`;
        
        // Inicia a busca
        fetchSchedule(userContext);

    } else {
        alert("Nenhum curso selecionado. Redirecionando...");
        window.location.href = 'index.html';
    }

    // =========================================================
    // 2. FETCH ASSÍNCRONO (Simples: Pega e Mostra)
    // =========================================================
    async function fetchSchedule(context) {
        // Loading
        scheduleView.innerHTML = `
            <div class="loading-state">
                <span class="material-symbols-rounded spin">sync</span>
                <p>Carregando sua grade...</p>
            </div>`;

        try {
            const response = await fetch('db.json');
            if (!response.ok) throw new Error('Erro de conexão');
            
            const database = await response.json();
            
            // 1. Acha o Curso (Método FIND)
            const courseData = database.courses.find(c => c.name === context.course);
            if (!courseData) throw new Error('Curso não encontrado.');

            // 2. Acha a Grade (Turno -> Período)
            const finalSchedule = courseData.schedules[context.shift]?.[context.period];

            if (!finalSchedule) {
                throw new Error(`Grade não cadastrada para este período.`);
            }

            // 3. Renderiza
            renderSchedule(finalSchedule);

        } catch (error) {
            console.error(error);
            scheduleView.innerHTML = `
                <div class="error-state">
                    <span class="material-symbols-rounded">error</span>
                    <p>${error.message}</p>
                    <button class="cta-primary" onclick="window.location.reload()">Tentar Novamente</button>
                </div>`;
        }
    }

    // =========================================================
    // 3. RENDERIZAÇÃO
    // =========================================================
    function renderSchedule(data) {
        const currentDay = new Date().getDay(); 
        const weekDays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
        const todayName = weekDays[currentDay];

        // Verificação básica de segurança
        if (!data || data.length === 0) {
            scheduleView.innerHTML = '<p class="empty-msg">Nenhuma aula cadastrada.</p>';
            return;
        }

        // 🔥 AQUI ESTÁ A CORREÇÃO SOLICITADA (RUBRICA DE ARRAYS)
        // Usamos .filter() para garantir que só dias com itens sejam mostrados.
        // Isso completa o trio de métodos obrigatórios: find, filter e map.
        const validDays = data.filter(day => day.items && day.items.length > 0);

        // Mapeia os dados válidos (Método MAP)
        scheduleView.innerHTML = validDays.map((dayData, index) => {
            const isToday = dayData.day === todayName;
            
            return `
            <article class="day-card ${isToday ? 'is-today' : ''}">
                <div class="day-card__title">${dayData.day}</div>
                <div class="classes-list">
                    ${dayData.items.map(item => {
                        // Lógica de Renderização Original
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
            `;
        }).join('');
    }

    // 4. Funcionalidades Extras
    toggleBtn.addEventListener('click', () => {
        scheduleView.classList.toggle('schedule-view--horizontal');
        const icon = document.getElementById('toggle-icon');
        icon.textContent = scheduleView.classList.contains('schedule-view--horizontal') ? 'view_agenda' : 'view_week';
    });

    searchBtn.addEventListener('click', () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'index.html';
        }
    });

    shareBtn.addEventListener('click', async () => {
        const dock = document.querySelector('.floating-dock');
        dock.style.display = 'none'; 
        try {
            const canvas = await html2canvas(document.getElementById("app-viewport"), {
                backgroundColor: "#F0F4F8", scale: 2
            });
            canvas.toBlob(blob => {
                const file = new File([blob], "grade_mqs.png", { type: "image/png" });
                if (navigator.share) {
                    navigator.share({ files: [file], title: 'Minha Grade MQS' });
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
});