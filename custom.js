/**
 * Controlador da Aplicação para a Tela de Grade Personalizada (custom.html).
 * Gerencia a seleção de períodos por turnos/dias e persiste o estado no LocalStorage.
 * Lida com a migração silenciosa de formatos de grade antigos para o formato baseado em objetos.
 */
document.addEventListener('DOMContentLoaded', () => {

    // Referências aos Cards de Dia e Popover
    const dayCards = document.querySelectorAll('.day-edit-card');
    const saveBtn = document.getElementById('btn-save-custom');
    const feedbackMsg = document.getElementById('form-feedback');
    const editContainer = document.querySelector('.edit-container');
    const clearAllBtn = document.getElementById('btn-clear-all');
    
    // Elementos do Popover
    const popover = document.getElementById('period-context-menu');
    const popoverBtns = popover.querySelectorAll('.popover-btn');
    let currentTargetBtn = null; // Armazena qual botão abriu o popover

    // Chave de armazenamento (O "Banco de Dados" local)
    const STORAGE_KEY = 'mqs_custom_grid';

    // ============================================================
    // 1. CARGA INICIAL (RESTORE STATE)
    // ============================================================
    loadSavedState();
    checkFormState();

    /**
     * Tenta carregar a grade personalizada previamente salva no LocalStorage.
     * Migra silenciosamente as antigas grades primitivas "baseadas em string" para um
     * formato baseado em objeto compatível antes da renderização.
     */
    function loadSavedState() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) return;

        try {
            const gridConfig = JSON.parse(savedData);
            let hasMigrated = false;

            // Para cada dia salvo, ativa os botões correspondentes na tela
            Object.keys(gridConfig).forEach(dayName => {
                const dayConfig = gridConfig[dayName]; // Ex formato antigo: { matutino: "3", noturno: "2" }
                const card = document.querySelector(`.day-edit-card[data-day="${dayName}"]`);

                if (card && dayConfig) {
                    // ===== INÍCIO DA MIGRAÇÃO SILENCIOSA =====
                    if (typeof dayConfig.matutino === 'string') {
                        const oldVal = dayConfig.matutino;
                        dayConfig.matutino = {};
                        dayConfig.matutino[oldVal] = 'full';
                        hasMigrated = true;
                    }
                    if (typeof dayConfig.noturno === 'string') {
                        const oldVal = dayConfig.noturno;
                        dayConfig.noturno = {};
                        dayConfig.noturno[oldVal] = 'full';
                        hasMigrated = true;
                    }
                    // ===== FIM DA MIGRAÇÃO SILENCIOSA =====

                    // Ativa período Matutino (agora é sempre um objeto de fatias)
                    if (dayConfig.matutino) {
                        Object.keys(dayConfig.matutino).forEach(periodVal => {
                            const btn = card.querySelector(`.period-grid[data-shift="matutino"] .period-btn[data-value="${periodVal}"]`);
                            if (btn) applySelectionVisuals(btn, dayConfig.matutino[periodVal]);
                        });
                    }
                    // Ativa período Noturno
                    if (dayConfig.noturno) {
                        Object.keys(dayConfig.noturno).forEach(periodVal => {
                            const btn = card.querySelector(`.period-grid[data-shift="noturno"] .period-btn[data-value="${periodVal}"]`);
                            if (btn) applySelectionVisuals(btn, dayConfig.noturno[periodVal]);
                        });
                    }
                    updateCardStatus(card);
                }
            });

            // Se convertemos dados antigos, salvamos imediatamente e avisamos o usuário
            if (hasMigrated) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(gridConfig));
                showFeedback("✨ Atualizamos sua grade! Agora você pode fatiar os horários e mesclar aulas clicando nelas.", "info");
            }

        } catch (e) {
            console.error("Erro ao carregar grade salva:", e);
            localStorage.removeItem(STORAGE_KEY); // Limpa se estiver corrompido
        }
    }


    // ============================================================
    // 2. LÓGICA DE INTERAÇÃO (CLIQUE NOS BOTÕES)
    // ============================================================

    dayCards.forEach(card => {
        const periodGrids = card.querySelectorAll('.period-grid');
        const clearBtn = card.querySelector('.btn-clear-day');

        periodGrids.forEach(grid => {
            const btns = grid.querySelectorAll('.period-btn');

            // Lógica de abertura do Popover ao clicar nos botões numéricos
            btns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Evita que o click feche o popover imediatamente
                    
                    // Se clicar no mesmo botão que já está com o popover aberto, fecha o popover
                    if (currentTargetBtn === btn && popover.classList.contains('is-active')) {
                        closePopover();
                        return;
                    }

                    // [REMOVIDO] A regra antiga de exclusividade que impedia montar
                    // 1ª aula do 4º per + 2ª aula do 5º per no mesmo turno.

                    openPopover(btn);
                    updateCardStatus(card);
                    checkFormState(); 
                });
            });
        });

        // Botão LIMPAR DIA (limpa tudo do card)
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                const allBtns = card.querySelectorAll('.period-btn');
                allBtns.forEach(b => b.classList.remove('active'));
                updateCardStatus(card);

                // Chamada essencial para remover o feedback visual do card
                updateCardStatus(card);
                checkFormState(); // Atualiza o botão mestre

                const dayName = card.querySelector('.day-name');
                dayName.style.color = 'var(--text-muted)';
                setTimeout(() => dayName.style.color = '', 300);
            });
        }
    });

    /**
     * Indica visualmente se um cartão de dia específico contém alguma seleção de período ativa.
     * @param {HTMLElement} card - O elemento DOM que representa o cartão do dia.
     */
    function updateCardStatus(card) {
        const hasSelection = card.querySelector('.period-btn.pill-full, .period-btn.pill-top, .period-btn.pill-bottom') !== null;
        card.classList.toggle('is-filled', hasSelection);
    }


    // ============================================================
    // 3. FUNÇÕES UTILITÁRIAS E POPOVER
    // ============================================================

    /**
     * Aplica a classe de seleção visual apropriada a um botão de período fornecido.
     * @param {HTMLElement} btn - O botão alvo.
     * @param {'full'|'top'|'bottom'} type - O tipo de seleção a aplicar.
     */
    function applySelectionVisuals(btn, type) {
        clearSelectionVisuals(btn);
        if (type === 'full') btn.classList.add('pill-full');
        else if (type === 'top') btn.classList.add('pill-top');
        else if (type === 'bottom') btn.classList.add('pill-bottom');
    }

    // Função que remove todas as classes daquele botão
    function clearSelectionVisuals(btn) {
        btn.classList.remove('pill-full', 'pill-top', 'pill-bottom');
    }

    // Identifica que tipo de botão é baseado nas classes CSS aplicadas (útil para salvar no LocalStorage)
    function getSelectionType(btn) {
        if (btn.classList.contains('pill-full')) return 'full';
        if (btn.classList.contains('pill-top')) return 'top';
        if (btn.classList.contains('pill-bottom')) return 'bottom';
        return null;
    }

    // --- LÓGICA DO MENU POPOVER ---

    function openPopover(targetBtn) {
        currentTargetBtn = targetBtn;
        
        // Pega as coordenadas matemáticas exatas do botão clicado em relação ao viewport
        const rect = targetBtn.getBoundingClientRect();
        
        // Posicionamento base via JS
        // Precisamos compensar o scroll (window.scrollY) pois o popover é "absolute" (comportando-se como fixed aqui)
        popover.style.top = `${rect.top + window.scrollY - popover.offsetHeight - 12}px`;
        popover.style.left = `${rect.left + (rect.width / 2) - (popover.offsetWidth / 2)}px`;

        popover.classList.add('is-active');
    }

    function closePopover() {
        popover.classList.remove('is-active');
        currentTargetBtn = null;
    }

    // Eventos do popover (Clicks nas opções de aula)
    popoverBtns.forEach(pBtn => {
        pBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!currentTargetBtn) return;

            const action = pBtn.dataset.action;
            const cardParent = currentTargetBtn.closest('.day-edit-card');

            if (action === 'clear') {
                clearSelectionVisuals(currentTargetBtn);
            } else {
                applySelectionVisuals(currentTargetBtn, action);
            }

            closePopover();
            if (cardParent) updateCardStatus(cardParent);
            checkFormState();
        });
    });

    // Fechar popover se clicar fora de qualquer coisa
    document.addEventListener('click', (e) => {
        if (popover.classList.contains('is-active')) {
            // Se o alvo não estiver dentro do popover e nem for um period-btn, fecha
            if (!popover.contains(e.target) && !e.target.classList.contains('period-btn')) {
                closePopover();
            }
        }
    });

    // ============================================================
    // 4. ESTADO DINÂMICO E SALVAMENTO
    // ============================================================

    // Evento do Botão Mestre de Limpar Tudo
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            // Remove todas as seleções preenchendo as classes visuais corretas
            const allBtns = document.querySelectorAll('.period-btn');
            allBtns.forEach(b => clearSelectionVisuals(b));
            
            // Atualiza o status visual (borda e fundo) de todos os cards
            dayCards.forEach(card => {
                card.classList.remove('is-filled');
                
                // Pisca o título para dar feedback visual de que foi apagado
                const dayName = card.querySelector('.day-name');
                dayName.style.color = 'var(--text-muted)';
                setTimeout(() => dayName.style.color = '', 300);
            });

            // Reavalia a tela para atualizar o botão principal e sumir com a lixeira
            checkFormState();
        });
    }

    /**
     * Verifica o estado geral da tela para adaptar o botão principal.
     */
    function checkFormState() {
        // Verifica se há seleções considerando as novas classes
        const hasAnySelection = document.querySelectorAll('.period-btn.pill-full, .period-btn.pill-top, .period-btn.pill-bottom').length > 0;
        const hasSavedGrid = localStorage.getItem(STORAGE_KEY) !== null;

        // Mostra ou esconde o botão da lixeira mestre
        if (clearAllBtn) {
            if (hasAnySelection) {
                clearAllBtn.classList.remove('is-hidden');
            } else {
                clearAllBtn.classList.add('is-hidden');
            }
        }

        if (!hasAnySelection && hasSavedGrid) {
            // Quer apagar a grade que já existe
            saveBtn.classList.add('btn-danger');
            saveBtn.innerHTML = `<span class="material-symbols-rounded">delete</span> Apagar Grade Personalizada`;
            saveBtn.style.background = ''; // Limpa estilo inline se houver
        } else {
            // Criando ou Atualizando normalmente
            saveBtn.classList.remove('btn-danger');
            saveBtn.innerHTML = `<span class="material-symbols-rounded">check</span> Salvar e Ver Grade`;
            saveBtn.style.background = '';
        }
    }

    // ============================================================
    // 5. VALIDAÇÃO DE CONFLITOS E SALVAMENTO SEGURO
    // ============================================================

    /**
     * Valida se um determinado objeto de grade personalizada tem conflitos de seleção de períodos
     * dentro do mesmo turno (ex: selecionar 'full' junto com uma seção 'top' ou 'bottom').
     * 
     * @param {Object} gridObject - A configuração da grade construída mapeada por dia.
     * @returns {string|null} - Uma mensagem de erro caso seja detectado um conflito, caso contrário null.
     */
    function validateSchedule(gridObject) {
        for (const [day, dayConfig] of Object.entries(gridObject)) {
            // Se a pessoa misturou algo no mesmo dia num mesmo turno, precisamos checar.
            // Para Matutino:
            if (dayConfig.matutino) {
                const matSelections = Object.values(dayConfig.matutino);
                const hasFull = matSelections.includes('full');
                
                // Conflitos mapeados:
                // 1. Tem 1 Full e mais QUALQUER outra coisa (Top, Bottom ou outro Full)
                if (hasFull && matSelections.length > 1) {
                    return `Conflito (Manhã de ${day}): Você selecionou um período completo junto de outras aulas.`;
                }
                
                // 2. Tem mais de 1 Top (2 professores diferentes dando a 1ª aula)
                if (matSelections.filter(x => x === 'top').length > 1) {
                    return `Conflito (Manhã de ${day}): Você selecionou mais de uma 1ª Aula no mesmo turno.`;
                }

                // 3. Tem mais de 1 Bottom (2 professores diferentes dando a 2ª aula)
                if (matSelections.filter(x => x === 'bottom').length > 1) {
                    return `Conflito (Manhã de ${day}): Você selecionou mais de uma 2ª Aula no mesmo turno.`;
                }
            }

            // Para Noturno (Mesma Lógica Numérica O[1]):
            if (dayConfig.noturno) {
                const notSelections = Object.values(dayConfig.noturno);
                const hasFull = notSelections.includes('full');
                
                if (hasFull && notSelections.length > 1) {
                    return `Conflito (Noite de ${day}): Você selecionou um período completo junto de outras aulas.`;
                }
                if (notSelections.filter(x => x === 'top').length > 1) {
                    return `Conflito (Noite de ${day}): Você selecionou mais de uma 1ª Aula no mesmo turno.`;
                }
                if (notSelections.filter(x => x === 'bottom').length > 1) {
                    return `Conflito (Noite de ${day}): Você selecionou mais de uma 2ª Aula no mesmo turno.`;
                }
            }
        }
        return null; // Null significa Sucesso
    }

    saveBtn.addEventListener('click', () => {
        const hasAnySelection = document.querySelectorAll('.period-btn.pill-full, .period-btn.pill-top, .period-btn.pill-bottom').length > 0;
        const hasSavedGrid = localStorage.getItem(STORAGE_KEY) !== null;

        if (!hasAnySelection && hasSavedGrid) {
            localStorage.removeItem(STORAGE_KEY);
            saveBtn.innerHTML = `<span class="material-symbols-rounded">delete_forever</span> Grade Apagada!`;
            setTimeout(() => window.location.href = 'index.html', 600);
            return;
        }

        if (!hasAnySelection) {
            showError("Selecione pelo menos um período para criar sua grade!");
            return;
        }

        // Fluxo Feliz -> Montar a grade lendo as fatias
        const finalGrid = {};
        
        dayCards.forEach(card => {
            const dayName = card.dataset.day;
            // Busca apenas botões que tem ALGUMA seleção de classe fatiada
            const matutinoBtns = card.querySelectorAll('.period-grid[data-shift="matutino"] .period-btn.pill-full, .period-grid[data-shift="matutino"] .period-btn.pill-top, .period-grid[data-shift="matutino"] .period-btn.pill-bottom');
            const noturnoBtns = card.querySelectorAll('.period-grid[data-shift="noturno"] .period-btn.pill-full, .period-grid[data-shift="noturno"] .period-btn.pill-top, .period-grid[data-shift="noturno"] .period-btn.pill-bottom');

            if (matutinoBtns.length > 0 || noturnoBtns.length > 0) {
                finalGrid[dayName] = {};
                
                if (matutinoBtns.length > 0) {
                    finalGrid[dayName].matutino = {};
                    matutinoBtns.forEach(btn => {
                        finalGrid[dayName].matutino[btn.dataset.value] = getSelectionType(btn);
                    });
                }
                
                if (noturnoBtns.length > 0) {
                    finalGrid[dayName].noturno = {};
                    noturnoBtns.forEach(btn => {
                        finalGrid[dayName].noturno[btn.dataset.value] = getSelectionType(btn);
                    });
                }
            }
        });

        // ==========================
        // VALIDAÇÃO ANTES DE SALVAR
        // ==========================
        const conflictError = validateSchedule(finalGrid);
        
        if (conflictError) {
            showError(conflictError);
            // Dá um feedback visual vibrando o botão
            saveBtn.classList.add('shake-anim');
            setTimeout(() => saveBtn.classList.remove('shake-anim'), 400);
            return;
        }

        // Se passar da validação, salva!
        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalGrid));

        saveBtn.innerHTML = `<span class="material-symbols-rounded">check_circle</span> Grade Salva!`;
        saveBtn.style.background = '#4CAF50';
        saveBtn.classList.remove('btn-danger');

        setTimeout(() => {
            window.location.href = 'grade.html?mode=custom';
        }, 600);
    });

    /**
     * Exibe feedback visual genérico com animação e cores personalizadas
     */
    function showFeedback(message, type = 'error') {
        if (!feedbackMsg) return;
        
        let icon = 'error';
        let bg = '#FFEBEE';
        let color = '#C62828';
        let border = '#EF9A9A';

        if (type === 'info') {
            icon = 'auto_awesome';
            bg = '#E3F2FD';
            color = '#1565C0';
            border = '#90CAF9';
        } else if (type === 'success') {
            icon = 'check_circle';
            bg = '#E8F5E9';
            color = '#2E7D32';
            border = '#A5D6A7';
        }

        feedbackMsg.innerHTML = `<span class="material-symbols-rounded">${icon}</span> ${message}`;
        feedbackMsg.style.background = bg;
        feedbackMsg.style.color = color;
        feedbackMsg.style.borderColor = border;
        feedbackMsg.classList.remove('hidden');

        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        feedbackMsg.classList.add('shake-anim');
        setTimeout(() => feedbackMsg.classList.remove('shake-anim'), 500);
    }

    function showError(message) {
        showFeedback(message, 'error');
    }

});