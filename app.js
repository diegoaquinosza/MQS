// =================================================================
// 🧠 MQS ENGINE - LÓGICA PRINCIPAL
// =================================================================

document.addEventListener('DOMContentLoaded', () => {

    // 1. DEFINIÇÃO DE VARIÁVEIS GLOBAIS (No topo para evitar erros de acesso)
    const scheduleView = document.getElementById('schedule-view'); // Container da grade
    const shareBtn = document.getElementById('btn-share');
    const homeBtn = document.getElementById('btn-home');

    // Elementos de Navegação (Setas)
    const btnLeft = document.getElementById('scroll-left');
    const btnRight = document.getElementById('scroll-right');

    // Elementos de Texto do Cabeçalho
    const displayCourse = document.getElementById('display-course');
    const displayPeriod = document.getElementById('display-period');


    // =========================================================
    // 2. INTEGRAÇÃO COM A HOME (Ler LocalStorage)
    // =========================================================
    const savedData = localStorage.getItem('mqs_user_data');
    let userContext = null;

    if (savedData) {
        userContext = JSON.parse(savedData);

        // Atualiza UI do Cabeçalho
        if (displayCourse) displayCourse.textContent = userContext.course;

        if (displayPeriod) {
            const shiftDisplay = userContext.shift.charAt(0).toUpperCase() + userContext.shift.slice(1);
            displayPeriod.textContent = `${userContext.period}º Período • ${shiftDisplay}`;
        }

        // Inicia a busca
        fetchSchedule(userContext);

    } else {
        // SEGURANÇA: Se não houver dados salvos, redireciona para a Home imediatamente.
        // Isso impede que o usuário fique preso na tela "Carregando..." ao acessar grade.html direto.
        console.warn("Nenhum dado encontrado. Redirecionando para a Home...");
        window.location.href = 'index.html';
        return; // Interrompe a execução do script aqui
    }

    // =========================================================
    // 3. FETCH ASSÍNCRONO
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

    // =========================================================
    // 4. RENDERIZAÇÃO
    // =========================================================
    function renderSchedule(data) {
        const currentDay = new Date().getDay();
        const weekDays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
        const todayName = weekDays[currentDay];

        if (!data || data.length === 0) {
            scheduleView.innerHTML = '<p class="empty-msg">Nenhuma aula cadastrada.</p>';
            return;
        }

        const validDays = data.filter(day => day.items && day.items.length > 0);

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

        // AJUSTE CIRÚRGICO: AUTO-SCROLL PARA O DIA ATUAL
        // Aguarda 100ms para o navegador desenhar os cards, depois rola até o dia certo
        setTimeout(() => {
            const todayCard = scheduleView.querySelector('.day-card.is-today');

            // Só executa se achar o card de hoje E se estivermos em Mobile/Tablet (< 1024px)
            // No Desktop geralmente queremos ver a grade inteira de uma vez
            if (todayCard && window.innerWidth < 1024) {
                // Calcula a posição: Posição do Card - Padding da tela (24px)
                // Isso faz o card encostar na esquerda, mas com um respiro elegante
                const scrollPosition = todayCard.offsetLeft - 24;

                scheduleView.scrollTo({
                    left: scrollPosition,
                    behavior: 'smooth'
                });
            }

            // Depois que acomodar o scroll, verifica as setas
            updateArrows();
        }, 100);
    }

    // =========================================================
    // 5. SISTEMA DE SETAS (Corrigido o erro de referência)
    // =========================================================
    function updateArrows() {
        // Usa as variáveis definidas lá no topo
        if (!scheduleView || !btnLeft || !btnRight) return;

        const scrollWidth = scheduleView.scrollWidth;
        const clientWidth = scheduleView.offsetWidth;
        const scrollLeft = scheduleView.scrollLeft;

        // Verifica se há conteúdo suficiente para rolar
        const isScrollable = scrollWidth > (clientWidth + 20);

        if (!isScrollable) {
            btnLeft.classList.add('is-hidden');
            btnRight.classList.add('is-hidden');
        } else {
            btnLeft.classList.toggle('is-hidden', scrollLeft <= 5);
            btnRight.classList.toggle('is-hidden', scrollLeft >= (scrollWidth - clientWidth - 5));
        }
    }

    // Listeners das Setas
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

    // =========================================================
    // 6. BOTÕES DE AÇÃO (Compartilhar e Home)
    // =========================================================

    // BOTÃO HOME
    // BOTÃO HOME
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            // Adiciona um parâmetro na URL para avisar a Home que queremos buscar algo novo
            window.location.href = 'index.html?action=search';
        });
    }

    // BOTÃO COMPARTILHAR
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const originalContent = shareBtn.innerHTML;
            shareBtn.innerHTML = '<span class="material-symbols-rounded spin">sync</span><span>Gerando...</span>';
            shareBtn.style.pointerEvents = 'none';

            try {
                // 1. CRIAR O PALCO INVISÍVEL (Largura Dinâmica Ajustada)
                const stage = document.createElement('div');
                stage.id = "temp-print-stage";
                stage.style.cssText = `
                position: fixed; top: 0; left: 0;
                width: fit-content; /* AJUSTE CIRÚRGICO: Abraça o conteúdo exato */
                min-width: 1024px; /* Segurança para o cabeçalho não quebrar se a grade for muito pequena */
                background-color: #F0F4F8;
                /* AJUSTE CIRÚRGICO: Padding lateral de 24px (igual ao gap entre cards) */
                padding: 60px 24px; 
                display: flex;
                flex-direction: column;
                align-items: center;
                z-index: -9999;
                font-family: 'Inter', sans-serif;
            `;

                // 2. CABEÇALHO SINTÉTICO (Com fontes ajustadas)
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

                // 3. CLONE DA GRADE
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

                // --- NOVO: 3.1. RODAPÉ SINTÉTICO ---
                const simpleFooter = document.createElement('div');
                simpleFooter.style.cssText = `
                    text-align: center;
                    margin-top: 50px; /* Espaço para separar da grade */
                    width: 100%;
                    color: #607D8B; /* Cor suave (muted) */
                    font-family: 'Inter', sans-serif;
                    font-size: 0.9rem;
                    line-height: 1.5;
                    opacity: 0.9;
                `;

                // RODAPÉ SINTÉTICO
                simpleFooter.innerHTML = `
                    <p style="margin: 0; font-weight: 700; letter-spacing: 0.5px;">MQS • Mano Qual é a Sala?!</p>
                    <p style="margin: 6px 0 0 0; color: #555;">
                        Criado por <strong>Diego Aquino</strong> <span style="color: #FFC107;">⚡</span>
                    </p>
                    <p style="margin: 4px 0 0 0; font-size: 0.85rem; opacity: 0.8;">
                        github.com/<strong>diegoaquinosza</strong>
                    </p>
                `;

                // 4. MONTAGEM DO PALCO
                stage.appendChild(simpleHeader);
                stage.appendChild(scheduleClone);
                stage.appendChild(simpleFooter); // <-- Adiciona o rodapé no final
                document.body.appendChild(stage);

                // 5. CAPTURA
                const options = {
                    scale: 2, // Mantém alta resolução (Retina)
                    backgroundColor: "#F0F4F8",
                    logging: false,
                    // width e windowWidth REMOVIDOS para detectar o tamanho "fit-content" automaticamente
                    ignoreElements: (el) => el.classList.contains('nav-arrow')
                };

                await new Promise(r => setTimeout(r, 100));

                const canvas = await html2canvas(stage, options);
                document.body.removeChild(stage);

                // 6. COMPARTILHAR / BAIXAR
                canvas.toBlob(blob => {
                    const file = new File([blob], "grade_mqs.png", { type: "image/png" });

                    if (navigator.share) {
                        // Monta o texto: Curso + Quebra de Linha + Detalhes (Período/Turno)
                        const shareText = `${displayCourse.textContent}\n${displayPeriod.textContent}`;

                        navigator.share({
                            files: [file],
                            title: 'Grade Horária', // Título para e-mail/sistema
                            text: shareText         // Legenda que vai no WhatsApp/Telegram
                        }).catch(e => console.log("Compartilhamento cancelado", e));

                    } else {
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
                shareBtn.innerHTML = originalContent;
                shareBtn.style.pointerEvents = 'auto';
            }
        });
    }
});