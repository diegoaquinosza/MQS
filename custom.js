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
                const dayConfig = gridConfig[dayName]; // Ex: { matutino: "3", noturno: "2" }
                const card = document.querySelector(`.day-edit-card[data-day="${dayName}"]`);

                if (card && dayConfig) {
                    // Ativa período Matutino (se existir)
                    if (dayConfig.matutino) {
                        const btn = card.querySelector(`.period-grid[data-shift="matutino"] .period-btn[data-value="${dayConfig.matutino}"]`);
                        if (btn) btn.classList.add('active');
                    }
                    // Ativa período Noturno (se existir)
                    if (dayConfig.noturno) {
                        const btn = card.querySelector(`.period-grid[data-shift="noturno"] .period-btn[data-value="${dayConfig.noturno}"]`);
                        if (btn) btn.classList.add('active');
                    }
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
        // Agora pegamos as duas linhas de períodos separadamente
        const periodGrids = card.querySelectorAll('.period-grid');
        const clearBtn = card.querySelector('.btn-clear-day');

        // Para cada linha de períodos (Matutino ou Noturno)
        periodGrids.forEach(grid => {
            const btns = grid.querySelectorAll('.period-btn');

            btns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Se clicar num botão já ativo, ele desmarca (permite remover apenas 1 turno)
                    if (btn.classList.contains('active')) {
                        btn.classList.remove('active');
                    } else {
                        // Remove ativo dos vizinhos da mesma linha e ativa o clicado
                        btns.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                    }
                    updateCardStatus(card);
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

                const dayName = card.querySelector('.day-name');
                dayName.style.color = 'var(--text-muted)';
                setTimeout(() => dayName.style.color = '', 300);
            });
        }
    });

    /**
     * Atualiza visualmente o card para indicar se está preenchido ou vazio.
     */
    function updateCardStatus(card) {
        // Verifica se existe algum botão de período ativo (Matutino ou Noturno)
        const hasSelection = card.querySelector('.period-btn.active') !== null;

        // Adiciona ou remove a classe de preenchimento
        if (hasSelection) {
            card.classList.add('is-filled');
        } else {
            card.classList.remove('is-filled');
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
            // Busca o botão ativo em cada linha especificamente
            const matutinoBtn = card.querySelector('.period-grid[data-shift="matutino"] .period-btn.active');
            const noturnoBtn = card.querySelector('.period-grid[data-shift="noturno"] .period-btn.active');

            // Se tiver pelo menos um selecionado, cria a entrada para o dia
            if (matutinoBtn || noturnoBtn) {
                finalGrid[dayName] = {};

                if (matutinoBtn) finalGrid[dayName].matutino = matutinoBtn.dataset.value;
                if (noturnoBtn) finalGrid[dayName].noturno = noturnoBtn.dataset.value;

                hasSelection = true;
            }
        });

        if (!hasSelection) {
            alert("Selecione pelo menos um período para criar sua grade!");
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