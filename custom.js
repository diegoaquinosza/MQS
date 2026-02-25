/**
 * Controlador da Tela de Personalização de Grade (custom.html)
 * Gerencia a seleção de turno e período por dia da semana e salva no LocalStorage.
 */
document.addEventListener('DOMContentLoaded', () => {

    // Referências aos Cards de Dia (Segunda, Terça, etc.)
    const dayCards = document.querySelectorAll('.day-edit-card');
    const saveBtn = document.getElementById('btn-save-custom');

    // Chave de armazenamento (O "Banco de Dados" local)
    const STORAGE_KEY = 'mqs_custom_grid';

    // ============================================================
    // 1. CARGA INICIAL (RESTORE STATE)
    // ============================================================
    loadSavedState();

    function loadSavedState() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) return;

        try {
            const gridConfig = JSON.parse(savedData);

            // Para cada dia salvo, ativa os botões correspondentes na tela
            Object.keys(gridConfig).forEach(dayName => {
                const dayConfig = gridConfig[dayName];
                const card = document.querySelector(`.day-edit-card[data-day="${dayName}"]`);

                if (card && dayConfig) {
                    // Ativa botão de Turno
                    const shiftBtn = card.querySelector(`.shift-btn[data-value="${dayConfig.shift}"]`);
                    if (shiftBtn) shiftBtn.classList.add('active');

                    // Ativa botão de Período
                    const periodBtn = card.querySelector(`.period-btn[data-value="${dayConfig.period}"]`);
                    if (periodBtn) periodBtn.classList.add('active');

                    updateCardStatus(card);
                }
            });
        } catch (e) {
            console.error("Erro ao carregar grade salva:", e);
            localStorage.removeItem(STORAGE_KEY); // Limpa se estiver corrompido
        }
    }


    // ============================================================
    // 2. LÓGICA DE INTERAÇÃO (CLIQUE NOS BOTÕES)
    // ============================================================
    
    dayCards.forEach(card => {
        const shiftBtns = card.querySelectorAll('.shift-btn');
        const periodBtns = card.querySelectorAll('.period-btn');
        const clearBtn = card.querySelector('.btn-clear-day');

        // Seleção de TURNO (Matutino/Noturno)
        shiftBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active dos irmãos
                shiftBtns.forEach(b => b.classList.remove('active'));
                // Ativa o clicado
                btn.classList.add('active');
                updateCardStatus(card);
            });
        });

        // Seleção de PERÍODO (1 a 6)
        periodBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active dos irmãos
                periodBtns.forEach(b => b.classList.remove('active'));
                // Ativa o clicado
                btn.classList.add('active');
                updateCardStatus(card);
            });
        });

        // Botão LIMPAR DIA
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                shiftBtns.forEach(b => b.classList.remove('active'));
                periodBtns.forEach(b => b.classList.remove('active'));
                updateCardStatus(card);
                
                // Feedback visual sutil
                const dayName = card.querySelector('.day-name');
                dayName.style.color = 'var(--text-muted)';
                setTimeout(() => dayName.style.color = '', 300);
            });
        }
    });

    /**
     * Atualiza visualmente o card para indicar se está preenchido ou vazio.
     * (Opcional, mas melhora a UX para saber quais dias faltam)
     */
    function updateCardStatus(card) {
        const hasShift = card.querySelector('.shift-btn.active');
        const hasPeriod = card.querySelector('.period-btn.active');
        
        // Aqui poderíamos mudar a cor da borda ou adicionar um ícone de "check"
        // Por enquanto, mantemos simples.
        if (hasShift && hasPeriod) {
            card.style.borderColor = 'var(--primary)';
            card.style.borderWidth = '1px';
            card.style.borderStyle = 'solid';
        } else {
            card.style.borderColor = 'transparent';
        }
    }


    // ============================================================
    // 3. SALVAR E NAVEGAR
    // ============================================================
    
    saveBtn.addEventListener('click', () => {
        const finalGrid = {};
        let hasSelection = false;

        // Varre todos os cards para montar o objeto final
        dayCards.forEach(card => {
            const dayName = card.dataset.day;
            const shiftBtn = card.querySelector('.shift-btn.active');
            const periodBtn = card.querySelector('.period-btn.active');

            // Só salva se o dia tiver AMBOS (Turno e Período) selecionados
            if (shiftBtn && periodBtn) {
                finalGrid[dayName] = {
                    shift: shiftBtn.dataset.value,
                    period: periodBtn.dataset.value
                };
                hasSelection = true;
            }
        });

        if (!hasSelection) {
            alert("Selecione pelo menos um dia para criar sua grade!");
            return;
        }

        // Salva no LocalStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalGrid));

        // Animação de sucesso no botão
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = `<span class="material-symbols-rounded">check_circle</span> Grade Salva!`;
        saveBtn.style.background = '#4CAF50';

        setTimeout(() => {
            // Redireciona para a visualização no modo CUSTOM
            window.location.href = 'grade.html?mode=custom';
        }, 600);
    });

});