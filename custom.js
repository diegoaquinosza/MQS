/**
 * Controlador da Tela de Personalização de Grade (custom.html)
 * Gerencia a seleção de turno e período por dia da semana e salva no LocalStorage.
 */
document.addEventListener('DOMContentLoaded', () => {

    // Referências aos Cards de Dia (Segunda, Terça, etc.)
    const dayCards = document.querySelectorAll('.day-edit-card');
    const saveBtn = document.getElementById('btn-save-custom');
    const feedbackMsg = document.getElementById('form-feedback');
    const editContainer = document.querySelector('.edit-container');
    const clearAllBtn = document.getElementById('btn-clear-all'); // Novo botão mestre de limpar

    // Chave de armazenamento (O "Banco de Dados" local)
    const STORAGE_KEY = 'mqs_custom_grid';

    // ============================================================
    // 1. CARGA INICIAL (RESTORE STATE)
    // ============================================================
    loadSavedState();
    checkFormState();

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
                    checkFormState(); // Atualiza o botão mestre
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
    // 3. ESTADO DINÂMICO E SALVAMENTO
    // ============================================================

    // Evento do Botão Mestre de Limpar Tudo
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            // Remove a seleção de todos os botões de período ativos
            const allActiveBtns = document.querySelectorAll('.period-btn.active');
            allActiveBtns.forEach(b => b.classList.remove('active'));
            
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
        const hasAnySelection = document.querySelector('.period-btn.active') !== null;
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

    saveBtn.addEventListener('click', () => {
        const hasAnySelection = document.querySelector('.period-btn.active') !== null;
        const hasSavedGrid = localStorage.getItem(STORAGE_KEY) !== null;

        // CENA 1: Usuário limpou tudo e já tinha grade -> Deletar Grade!
        if (!hasAnySelection && hasSavedGrid) {
            localStorage.removeItem(STORAGE_KEY);
            saveBtn.innerHTML = `<span class="material-symbols-rounded">delete_forever</span> Grade Apagada!`;
            
            setTimeout(() => {
                // Ao apagar, volta para a home para recalcular estado de veterano
                window.location.href = 'index.html';
            }, 600);
            return;
        }

        // CENA 2: Tela vazia, mas ele não tem grade salva (Tentando salvar o nada)
        if (!hasAnySelection) {
            showError("Selecione pelo menos um período para criar sua grade!");
            return;
        }

        // CENA 3: Fluxo Feliz -> Montar e salvar a grade
        const finalGrid = {};
        
        dayCards.forEach(card => {
            const dayName = card.dataset.day;
            const matutinoBtn = card.querySelector('.period-grid[data-shift="matutino"] .period-btn.active');
            const noturnoBtn = card.querySelector('.period-grid[data-shift="noturno"] .period-btn.active');

            if (matutinoBtn || noturnoBtn) {
                finalGrid[dayName] = {};
                if (matutinoBtn) finalGrid[dayName].matutino = matutinoBtn.dataset.value;
                if (noturnoBtn) finalGrid[dayName].noturno = noturnoBtn.dataset.value;
            }
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalGrid));

        saveBtn.innerHTML = `<span class="material-symbols-rounded">check_circle</span> Grade Salva!`;
        saveBtn.style.background = '#4CAF50';
        saveBtn.classList.remove('btn-danger');

        setTimeout(() => {
            window.location.href = 'grade.html?mode=custom';
        }, 600);
    });

    /**
     * Exibe feedback visual de erro padronizado com animação de vibração.
     */
    function showError(message) {
        if (!feedbackMsg) return;
        
        feedbackMsg.innerHTML = `<span class="material-symbols-rounded">error</span> ${message}`;
        feedbackMsg.classList.remove('hidden');

        // Garante que o usuário veja o erro no topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Efeito de vibração (shake) apenas no banner de erro (mais suave)
        feedbackMsg.classList.add('shake-anim');
        setTimeout(() => feedbackMsg.classList.remove('shake-anim'), 500);
    }

});