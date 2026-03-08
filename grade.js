/**
 * Motor principal da aplicação (MQS Engine).
 * Responsável pela orquestração de dados, renderização da grade horária,
 * gerenciamento de estado da sessão e funcionalidade de compartilhamento (screenshot).
 */
document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // VARIÁVEIS E REFERÊNCIAS DO DOM
    // =================================================================
    
    const scheduleView = document.getElementById('schedule-view');
    const shareBtn = document.getElementById('btn-share');
    const shareIcon = document.getElementById('icon-share');
    const homeBtn = document.getElementById('btn-home');
    const customBtn = document.getElementById('btn-custom-grade');
    const feedbackBtn = document.getElementById('btn-feedback');
    const donateBtn = document.getElementById('btn-donate');
    const pixPopover = document.getElementById('pix-popover');
    const closePixBtn = document.getElementById('btn-close-pix');
    const copyPixBtn = document.getElementById('btn-copy-pix');

    // =================================================================
    // UX NATIVA: DETECÇÃO DE PLATAFORMA PARA ÍCONE DE COMPARTILHAR
    // =================================================================
    if (shareIcon) {
        // Verifica se o usuário está em um dispositivo da Apple
        const isAppleDevice = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
        shareIcon.textContent = isAppleDevice ? 'ios_share' : 'share';
    }

    // Controles de Navegação Horizontal
    const btnLeft = document.getElementById('scroll-left');
    const btnRight = document.getElementById('scroll-right');

    // Elementos de UI (Cabeçalho)
    const displayCourse = document.getElementById('display-course');
    const displayPeriod = document.getElementById('display-period');


    // =================================================================
    // GERENCIAMENTO DE SESSÃO E ESTADO
    // =================================================================
    
    // [EDITADO] Verifica modo personalizado via URL ou modo padrão via LocalStorage
    const urlParams = new URLSearchParams(window.location.search);
    const isCustomMode = urlParams.get('mode') === 'custom';
    const savedData = localStorage.getItem('mqs_user_data');
    let userContext = null;

    if (isCustomMode) {
        // ROTA A: MODO PERSONALIZADO
        if (displayCourse) displayCourse.textContent = "Minha Grade";
        if (displayPeriod) displayPeriod.textContent = "Planejamento Personalizado";
        
        // Inicia o novo "Mixer" (função que criaremos abaixo)
        fetchCustomSchedule();

    } else if (savedData) {
        // ROTA B: MODO PADRÃO (Comportamento original)
        userContext = JSON.parse(savedData);

        if (displayCourse) displayCourse.textContent = userContext.course;
        if (displayPeriod) {
            const shiftDisplay = userContext.shift.charAt(0).toUpperCase() + userContext.shift.slice(1);
            displayPeriod.textContent = `${userContext.period}º Período • ${shiftDisplay}`;
        }

        fetchSchedule(userContext);

    } else {
        // Fallback de Segurança
        console.warn("Sessão inválida. Redirecionando...");
        window.location.href = 'index.html';
        return;
    }

    /**
     * Busca, mescla e renderiza uma grade mista com base na configuração personalizada do usuário.
     * Incorpora migração silenciosa para interpretar configurações antigas (em string).
     */
    async function fetchCustomSchedule() {
        // Reutiliza o loading visual
        scheduleView.innerHTML = `
            <div class="loading-state">
                <span class="material-symbols-rounded spin">sync</span>
                <p>Carregando sua grade...</p>
            </div>`;

        const customConfigRaw = localStorage.getItem('mqs_custom_grid');
        
        // Se não tiver config salva, manda criar
        if (!customConfigRaw) {
            renderError("Nenhuma configuração encontrada.", "Criar Grade", "custom.html");
            return;
        }

        try {
            const customConfig = JSON.parse(customConfigRaw);
            let hasMigrated = false;

            // ===== INÍCIO DA MIGRAÇÃO SILENCIOSA =====
            Object.keys(customConfig).forEach(day => {
                if (customConfig[day].matutino && typeof customConfig[day].matutino === 'string') {
                    const oldVal = customConfig[day].matutino;
                    customConfig[day].matutino = {};
                    customConfig[day].matutino[oldVal] = 'full';
                    hasMigrated = true;
                }
                if (customConfig[day].noturno && typeof customConfig[day].noturno === 'string') {
                    const oldVal = customConfig[day].noturno;
                    customConfig[day].noturno = {};
                    customConfig[day].noturno[oldVal] = 'full';
                    hasMigrated = true;
                }
            });

            if (hasMigrated) {
                localStorage.setItem('mqs_custom_grid', JSON.stringify(customConfig));
            }
            // ===== FIM DA MIGRAÇÃO SILENCIOSA =====

            const response = await fetch('db.json?v=20260308');
            if (!response.ok) throw new Error('Erro de conexão');
            
            const database = await response.json();
            
            // Assume curso padrão (Sistemas) pois a personalização é focada nele por enquanto
            const courseData = database.courses.find(c => c.name === "Sistemas para Internet");
            if (!courseData) throw new Error('Dados do curso base não encontrados.');

            const mixedSchedule = [];
            const daysOrder = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

            // Super Loop Mágico: Funde Matutino e Noturno com Identificadores Visuais
            daysOrder.forEach(day => {
                const config = customConfig[day]; 
                
                if (config) {
                    let dayItems = []; 
                    
                    // 1. Processar turnos do Matutino
                    if (config.matutino && Object.keys(config.matutino).length > 0) {
                        dayItems.push({ type: 'shift-label', shift: 'matutino', icon: 'light_mode', label: 'Manhã' });
                        
                        Object.keys(config.matutino).forEach(periodStr => {
                            const selectionType = config.matutino[periodStr];
                            const matSchedule = courseData.schedules['matutino']?.[periodStr];
                            
                            if (matSchedule) {
                                const dayClasses = matSchedule.find(d => d.day === day);
                                if (dayClasses && dayClasses.items) {
                                    dayItems = dayItems.concat(filterScheduleItems(dayClasses.items, selectionType));
                                }
                            }
                        });
                    }

                    // 2. Processar turnos do Noturno
                    if (config.noturno && Object.keys(config.noturno).length > 0) {
                        dayItems.push({ type: 'shift-label', shift: 'noturno', icon: 'dark_mode', label: 'Noite' });
                        
                        Object.keys(config.noturno).forEach(periodStr => {
                            const selectionType = config.noturno[periodStr];
                            const notSchedule = courseData.schedules['noturno']?.[periodStr];
                            
                            if (notSchedule) {
                                const dayClasses = notSchedule.find(d => d.day === day);
                                if (dayClasses && dayClasses.items) {
                                    dayItems = dayItems.concat(filterScheduleItems(dayClasses.items, selectionType));
                                }
                            }
                        });
                    }

                    // 3. Empacota o dia (Se tem aulas)
                    if (dayItems.length > 0) {
                        mixedSchedule.push({
                            day: day,
                            items: dayItems
                        });
                    }
                } else if (day !== "Sábado") {
                    // 4. Injeta Dia Livre (Cartão Fantasma) para dias da semana sem aulas
                    mixedSchedule.push({
                        day: day,
                        items: [{
                            type: 'free-day',
                            emoji: '🛋️',
                            title: 'Dia Livre!',
                            message: 'Aproveite para colocar os estudos em dia ou descansar.'
                        }]
                    });
                }
            });

            if (mixedSchedule.length === 0) throw new Error("Sua grade está vazia. Configure os dias.");

            renderSchedule(mixedSchedule);

        } catch (error) {
            console.error(error);
            renderError(error.message, "Reconfigurar", "custom.html");
        }
    }

    /**
     * Filtra um array de itens da grade com base na seleção de fração feita pelo usuário.
     * @param {Array} itemsArray - O array bruto de itens para um determinado dia/período.
     * @param {'full'|'top'|'bottom'} selectionType - O tipo de fração selecionada.
     * @returns {Array} - O array filtrado de itens que representa a fração selecionada.
     */
    function filterScheduleItems(itemsArray, selectionType) {
        if (!itemsArray || itemsArray.length === 0) return [];
        
        // Formato padrão do MQS: [Aula 1, Intervalo, Aula 2]
        if (selectionType === 'full') {
            return itemsArray; // Pega tudo
        } else if (selectionType === 'top') {
            // Retorna apenas os itens que terminam ANTES ou IGUAL ao início do intervalo
            // (Para garantir compatibilidade, pegamos o primeiro item class)
            const firstClass = itemsArray.find(item => item.type === 'class');
            return firstClass ? [firstClass] : [];
        } else if (selectionType === 'bottom') {
            // Retorna a segunda aula
            const classesOnly = itemsArray.filter(item => item.type === 'class');
            return classesOnly.length > 1 ? [classesOnly[1]] : classesOnly; 
        }
        
        return itemsArray; // Fallback
    }

    // [HELPER] Função auxiliar para erros (para não repetir código)
    function renderError(msg, btnText, action) {
        const actionAttr = action.includes('custom') ? `onclick="window.location.href='${action}'"` : `onclick="window.location.reload()"`;
        scheduleView.innerHTML = `
            <div class="error-state">
                <span class="material-symbols-rounded">error</span>
                <p>${msg}</p>
                <button class="cta-primary" ${actionAttr} style="width:auto; margin-top:12px;">${btnText}</button>
            </div>`;
    }
    
    /**
     * Busca os dados da grade no repositório local (JSON) baseada no contexto do usuário.
     * @param {Object} context - Objeto contendo curso, turno e período selecionados.
     */
    async function fetchSchedule(context) {
        // Renderiza estado de carregamento
        scheduleView.innerHTML = `
            <div class="loading-state">
                <span class="material-symbols-rounded spin">sync</span>
                <p>Carregando sua grade...</p>
            </div>`;

        try {
            const response = await fetch('db.json?v=20260308');
            if (!response.ok) throw new Error('Erro de conexão');

            const database = await response.json();

            // Busca e validação hierárquica (Curso -> Turno -> Período)
            const courseData = database.courses.find(c => c.name === context.course);
            if (!courseData) throw new Error('Curso não encontrado.');

            const finalSchedule = courseData.schedules[context.shift]?.[context.period];

            if (!finalSchedule) {
                throw new Error(`Grade não cadastrada para este período.`);
            }

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

    /**
     * Renderiza os cartões de aula no DOM e gerencia o scroll inicial.
     * @param {Array} data - Array de objetos representando os dias da semana e aulas.
     */
    function renderSchedule(data) {
        const currentDay = new Date().getDay();
        const weekDays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
        const todayName = weekDays[currentDay];

        if (!data || data.length === 0) {
            scheduleView.innerHTML = '<p class="empty-msg">Nenhuma aula cadastrada.</p>';
            return;
        }

        const validDays = data.filter(day => day.items && day.items.length > 0);

        // Construção do HTML via Template String
        scheduleView.innerHTML = validDays.map((dayData) => {
            const isToday = dayData.day === todayName;

            return `
            <article class="day-card ${isToday ? 'is-today' : ''}">
                <div class="day-card__title">${dayData.day}</div>
                <div class="classes-list">
                    ${dayData.items.map(item => {
                if (item.type === 'interval') {
                    return `
                            <div class="interval-pill">
                                <span>${item.timeStart}</span>
                                <span>${item.label}</span>
                                <span>${item.timeEnd}</span>
                            </div>`;
                } else if (item.type === 'shift-label') { // Rótulo de turno
                    return `
                            <div class="shift-pill ${item.shift}">
                                <span class="material-symbols-rounded" style="font-size: 16px;">${item.icon}</span>
                                <span>${item.label}</span>
                            </div>`;
                } else if (item.type === 'free-day') { // <-- NOVO: RENDERIZA O DIA LIVRE
                    return `
                            <div class="free-day-card">
                                <span class="free-day-emoji">${item.emoji}</span>
                                <p class="free-day-title">${item.title}</p>
                                <p class="free-day-text">${item.message}</p>
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

        // UX: Scroll Automático para o dia corrente
        // O timeout garante que o browser finalizou o paint do DOM antes de calcular o scroll
        setTimeout(() => {
            const todayCard = scheduleView.querySelector('.day-card.is-today');

            // Aplica scroll apenas em viewports móveis (< 1920px) para focar no dia
            if (todayCard && window.innerWidth < 1920) {
                todayCard.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }

            updateArrows();
        }, 100);
    }

    /**
     * Controla a visibilidade das setas de navegação horizontal baseada no scrollWidth.
     */
    function updateArrows() {
        if (!scheduleView || !btnLeft || !btnRight) return;

        const scrollWidth = scheduleView.scrollWidth;
        const clientWidth = scheduleView.offsetWidth;
        const scrollLeft = scheduleView.scrollLeft;

        // Tolerância de 20px para evitar flickering em bordas arredondadas
        const isScrollable = scrollWidth > (clientWidth + 20);

        if (!isScrollable) {
            btnLeft.classList.add('is-hidden');
            btnRight.classList.add('is-hidden');
        } else {
            btnLeft.classList.toggle('is-hidden', scrollLeft <= 5);
            btnRight.classList.toggle('is-hidden', scrollLeft >= (scrollWidth - clientWidth - 5));
        }
    }

    // Inicialização dos Listeners de Scroll
    if (scheduleView && btnLeft && btnRight) {
        const getScrollStep = () => {
            const card = scheduleView.querySelector('.day-card');
            return card ? card.offsetWidth + 24 : 300;
        };

        btnLeft.onclick = () => scheduleView.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
        btnRight.onclick = () => scheduleView.scrollBy({ left: getScrollStep(), behavior: 'smooth' });

        scheduleView.addEventListener('scroll', updateArrows);
        window.addEventListener('resize', updateArrows);
    }

    // =================================================================
    // AÇÕES DO USUÁRIO (HOME & SHARE)
    // =================================================================

    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            // Flag 'action=search' força a Home a limpar o estado visual anterior
            window.location.href = 'index.html?action=search';
        });
    }
    // Listener do botão de personalização
    if (customBtn) {
        customBtn.addEventListener('click', () => {
            window.location.href = 'custom.html';
        });
    }

    // Listener do botão de feedback (E-mail)
    if (feedbackBtn) {
        feedbackBtn.addEventListener('click', () => {
            const email = 'diegoaquinosza@gmail.com';
            const subject = encodeURIComponent('Feedback MQS');
            const body = encodeURIComponent('Olá,\n\nEncontrei a seguinte inconsistência na grade:\n\n[Descreva aqui o problema]');
            window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
        });
    }

    // Lógica do Botão de Doação (PIX)
    if (donateBtn && pixPopover) {
        donateBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            pixPopover.classList.toggle('hidden');
        });

        closePixBtn.addEventListener('click', () => {
            pixPopover.classList.add('hidden');
        });

        // Fecha ao clicar fora do popover
        document.addEventListener('click', (e) => {
            if (!pixPopover.contains(e.target) && e.target !== donateBtn) {
                pixPopover.classList.add('hidden');
            }
        });

        if (copyPixBtn) {
            copyPixBtn.addEventListener('click', () => {
                const pixKey = "diegoaquinosza@gmail.com";
                navigator.clipboard.writeText(pixKey).then(() => {
                    const originalText = copyPixBtn.innerHTML;
                    copyPixBtn.innerHTML = '<span class="material-symbols-rounded">check</span> Copiado!';
                    copyPixBtn.style.background = '#4CAF50';
                    
                    setTimeout(() => {
                        copyPixBtn.innerHTML = originalText;
                        copyPixBtn.style.background = '';
                    }, 2000);
                });
            });
        }
    }

    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const originalContent = shareBtn.innerHTML;
            
            // Feedback visual de carregamento
            shareBtn.innerHTML = '<span class="material-symbols-rounded spin">sync</span><span>Gerando...</span>';
            shareBtn.style.pointerEvents = 'none';

            try {
                // ESTRATÉGIA DE SNAPSHOT:
                // Cria um elemento DOM "fantasma" (stage) fora da viewport visível.
                // Isso permite renderizar uma versão limpa e estilizada especificamente para imagem,
                // sem afetar a UI atual do usuário.

                // 1. Configuração do Container Temporário
                const stage = document.createElement('div');
                stage.id = "temp-print-stage";
                stage.style.cssText = `
                position: fixed; top: 0; left: 0;
                width: fit-content; 
                min-width: 1024px;
                background-color: #F0F4F8;
                padding: 60px 24px; 
                display: flex;
                flex-direction: column;
                align-items: center;
                z-index: -9999;
                font-family: 'Inter', sans-serif;
            `;

                // 2. Construção do Cabeçalho Sintético (Snapshot Only)
                const simpleHeader = document.createElement('div');
                simpleHeader.style.cssText = "text-align: center; margin-bottom: 40px; width: 100%;";

                simpleHeader.innerHTML = `
                    <div style="background: #00897bd0; color: white; display: inline-block; padding: 8px 16px; border-radius: 12px; font-weight: 800; font-size: 1.1rem; margin-bottom: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                        MQS
                    </div>
                    <h1 style="color: #00816b; font-size: 2.2rem; margin: 0 0 8px 0; line-height: 1.2;">
                        ${displayCourse ? displayCourse.textContent : 'Curso'}
                    </h1>
                    <h3 style="color: #607D8B; font-size: 1.3rem; font-weight: 500; margin: 0;">
                        ${displayPeriod ? displayPeriod.textContent : 'Horários'}
                    </h3>
                `;

                // 3. Clonagem e Adaptação da Grade
                // Transforma o layout de Grid/Scroll (App) para Flex/Row (Imagem Estática)
                const scheduleClone = scheduleView.cloneNode(true);
                scheduleClone.style.cssText = `
                    display: flex !important;
                    flex-direction: row !important;
                    justify-content: center !important;
                    gap: 24px !important;
                    width: 100% !important;
                    padding: 0 !important;
                    overflow: visible !important;
                `;

                const cards = scheduleClone.querySelectorAll('.day-card');
                cards.forEach(card => {
                    card.style.cssText = `
                        flex: 0 0 auto !important;
                        width: 300px !important;
                        min-width: 300px !important;
                        margin: 0 !important;
                    `;
                });

                // 4. Construção do Rodapé Sintético
                const simpleFooter = document.createElement('div');
                simpleFooter.style.cssText = `
                    text-align: center;
                    margin-top: 50px;
                    width: 100%;
                    color: #607D8B;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.9rem;
                    line-height: 1.5;
                    opacity: 0.9;
                `;

                simpleFooter.innerHTML = `
                    <p style="margin: 0; font-weight: 700; letter-spacing: 0.5px;">MQS • "Mano, Qual é a Sala?!"</p>
                    <p style="margin: 6px 0 0 0; color: #555;">
                        Criado por <strong>Diego Aquino</strong> <span style="color: #FFC107;">⚡</span>
                    </p>
                    <p style="margin: 4px 0 0 0; font-size: 0.85rem; opacity: 0.8;">
                        github.com/<strong>diegoaquinosza</strong>
                    </p>
                `;

                // 5. Renderização no DOM
                stage.appendChild(simpleHeader);
                stage.appendChild(scheduleClone);
                stage.appendChild(simpleFooter);
                document.body.appendChild(stage);

                // 6. Geração do Canvas
                const options = {
                    scale: 2, // Garante nitidez em telas Retina/High-DPI
                    backgroundColor: "#F0F4F8",
                    logging: false,
                    ignoreElements: (el) => el.classList.contains('nav-arrow') // Remove elementos de UI da imagem
                };

                await new Promise(r => setTimeout(r, 100)); // Aguarda renderização do browser

                const canvas = await html2canvas(stage, options);
                document.body.removeChild(stage); // Limpeza do DOM

                // 7. Exportação (Web Share API ou Download direto)
                canvas.toBlob(blob => {
                    const file = new File([blob], "grade_mqs.png", { type: "image/png" });

                    if (navigator.share) {
                        const shareText = `${displayCourse.textContent}\n${displayPeriod.textContent}`;
                        navigator.share({
                            files: [file],
                            title: 'Grade Horária',
                            text: shareText
                        }).catch(e => console.log("Compartilhamento cancelado", e));

                    } else {
                        // Fallback para Desktop
                        const link = document.createElement('a');
                        link.download = 'grade_mqs.png';
                        link.href = URL.createObjectURL(blob);
                        link.click();
                    }
                }, 'image/png');

            } catch (error) {
                console.error(error);
                alert("Erro ao gerar imagem.");
            } finally {
                // Restaura estado do botão
                shareBtn.innerHTML = originalContent;
                shareBtn.style.pointerEvents = 'auto';
            }
        });
    }
});