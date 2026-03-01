/**
 * Controlador principal da Home.
 * Gerencia a inicialização da aplicação, alternância entre estados (Warm Start/Formulário),
 * validação de entradas e interações de UI.
 */
document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // SELEÇÃO DE ELEMENTOS DO DOM
    // ============================================================

    // Containers Principais
    const form = document.getElementById('selection-form');
    const warmDiv = document.getElementById('warm-welcome');

    // Componentes do Warm Start (Estado Logado)
    const savedCourse = document.getElementById('saved-course');
    const savedDetails = document.getElementById('saved-details');
    const quickBtn = document.getElementById('btn-quick-access');
    const resetBtn = document.getElementById('btn-reset-app');
    const customAccessBtn = document.getElementById('btn-custom-access');
    const iconCustomAccess = document.getElementById('icon-custom-access');
    const editCustomBtn = document.getElementById('btn-edit-custom');
    const tipTextElement = document.getElementById('warm-tip-text');
    const formCustomAccessBtn = document.getElementById('btn-form-custom-access');
    const textFormCustomAccess = document.getElementById('text-form-custom-access');
    const textCustomAccess = document.getElementById('text-custom-access');

    // Componentes do Formulário (Novo Acesso)
    const courseInput = document.getElementById('course-input');
    const shiftBtns = document.querySelectorAll('.choice-chip');
    const periodBtns = document.querySelectorAll('.chip-btn');
    const submitBtn = document.getElementById('btn-ver-horarios');
    const feedbackMsg = document.getElementById('form-feedback');

    // Componentes de Navegação (Scroll Horizontal)
    const scrollContainer = document.getElementById('period-selector');
    const btnLeft = document.getElementById('btn-scroll-left');
    const btnRight = document.getElementById('btn-scroll-right');

    /**
     * Gerencia a visibilidade das setas de navegação horizontal.
     * Calcula se o conteúdo excede a largura do container e oculta setas nos limites.
     */
    const updateMiniArrows = () => {
        if (!scrollContainer || !btnLeft || !btnRight) return;

        const scrollWidth = scrollContainer.scrollWidth;
        const clientWidth = scrollContainer.offsetWidth;
        const scrollLeft = scrollContainer.scrollLeft;

        // Verifica se há conteúdo suficiente para rolar
        const isScrollable = scrollWidth > (clientWidth + 10);

        if (!isScrollable) {
            btnLeft.classList.add('hidden');
            btnRight.classList.add('hidden');
        } else {
            // Controle da seta esquerda (início)
            if (scrollLeft <= 5) btnLeft.classList.add('hidden');
            else btnLeft.classList.remove('hidden');

            // Controle da seta direita (fim)
            if (scrollLeft >= (scrollWidth - clientWidth - 5)) btnRight.classList.add('hidden');
            else btnRight.classList.remove('hidden');
        }
    };

    // Estado local da seleção do usuário
    let userSelection = { course: '', shift: null, period: null };

    const ALLOWED_COURSES = [
        "Sistemas para Internet",
        "sistemas para internet",
        "Sistemas Para Internet"
    ];

    // ============================================================
    // LÓGICA DE INICIALIZAÇÃO E ESTADO
    // ============================================================
    const savedData = localStorage.getItem('mqs_user_data');
    const customData = localStorage.getItem('mqs_custom_grid');
    const urlParams = new URLSearchParams(window.location.search);

    // Verifica se a ação é uma nova busca explícita via URL
    const forceNewSearch = urlParams.get('action') === 'search';

    // Decide entre exibir o Warm Start ou o Formulário Limpo
    if ((savedData || customData) && !forceNewSearch) {
        form.classList.add('hidden');
        warmDiv.classList.remove('hidden');

        // Dinamismo dos Botões: Verifica a Grade Personalizada
        if (customData) {
            customAccessBtn.className = 'cta-primary';
            if (iconCustomAccess) iconCustomAccess.style.color = 'white';
            if (textCustomAccess) textCustomAccess.textContent = 'Ver minha grade';
            quickBtn.className = 'btn-tonal outline-btn';
            if (editCustomBtn) editCustomBtn.classList.remove('hidden');
        } else {
            customAccessBtn.className = 'btn-tonal outline-btn';
            if (iconCustomAccess) iconCustomAccess.style.color = 'var(--primary)';
            if (textCustomAccess) textCustomAccess.textContent = 'Montar minha grade';
            quickBtn.className = 'cta-primary';
            if (editCustomBtn) editCustomBtn.classList.add('hidden');
        }

        if (savedData) {
            // Cenário A: Tem busca padrão salva
            const data = JSON.parse(savedData);
            savedCourse.textContent = data.course;
            const shiftFormatted = data.shift.charAt(0).toUpperCase() + data.shift.slice(1);
            savedDetails.textContent = `${data.period}º Período • ${shiftFormatted}`;
            quickBtn.textContent = "Ver grade padrão";
        } else {
            // Cenário B: Aluno nunca pesquisou a padrão (Edge Case tratado)
            savedCourse.textContent = "Sem histórico padrão";
            savedDetails.textContent = "Consulte uma grade para salvá-la";
            quickBtn.textContent = "Consultar grade padrão";
        }

    } else {
        warmDiv.classList.add('hidden');
        form.classList.remove('hidden');

        // Dinamismo do Botão do Formulário
        if (customData && textFormCustomAccess) {
            textFormCustomAccess.textContent = "Ver minha grade";
        } else if (textFormCustomAccess) {
            textFormCustomAccess.textContent = "Montar minha grade";
        }

        // Limpa a URL para evitar loop de estado ao recarregar a página
        if (forceNewSearch) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    // ============================================================
    // INTERAÇÕES DE USUÁRIO
    // ============================================================

    quickBtn.addEventListener('click', () => {
        // Se não tem grade padrão salva, envia ele para buscar
        if (!localStorage.getItem('mqs_user_data')) {
            window.location.href = 'index.html?action=search';
        } else {
            window.location.href = 'grade.html';
        }
    });

    if (editCustomBtn) {
        editCustomBtn.addEventListener('click', () => {
            window.location.href = 'custom.html';
        });
    }

    resetBtn.addEventListener('click', () => {
        // Limpeza total do estado e persistência
        localStorage.removeItem('mqs_user_data');
        warmDiv.classList.add('hidden');
        form.classList.remove('hidden');

        // Atualização Dinâmica do botão "Minha Grade" ao voltar para o formulário
        const hasCustomGrid = localStorage.getItem('mqs_custom_grid');
        if (hasCustomGrid && textFormCustomAccess) {
            textFormCustomAccess.textContent = "Ver minha grade";
        } else if (textFormCustomAccess) {
            textFormCustomAccess.textContent = "Montar minha grade";
        }

        courseInput.value = '';
        userSelection = { course: '', shift: null, period: null };
        feedbackMsg.classList.add('hidden');

        shiftBtns.forEach(btn => btn.classList.remove('active'));
        periodBtns.forEach(btn => btn.classList.remove('active'));

        setTimeout(updateMiniArrows, 50);
    });

    // Função auxiliar para verificar a grade e redirecionar corretamente
    const handleCustomGridAccess = () => {
        const hasCustomGrid = localStorage.getItem('mqs_custom_grid');
        if (hasCustomGrid) {
            window.location.href = 'grade.html?mode=custom';
        } else {
            window.location.href = 'custom.html';
        }
    };

    // Botão de acesso na tela de Warm Start (Veteranos)
    if (customAccessBtn) {
        customAccessBtn.addEventListener('click', handleCustomGridAccess);
    }

    // Botão de acesso no Formulário Inicial (Calouros)
    if (formCustomAccessBtn) {
        formCustomAccessBtn.addEventListener('click', handleCustomGridAccess);
    }

    shiftBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            userSelection.shift = btn.getAttribute('data-value');
            updateVisuals(shiftBtns, userSelection.shift);
        });
    });

    periodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            userSelection.period = btn.getAttribute('data-value');
            updateVisuals(periodBtns, userSelection.period);
        });
    });

    // ============================================================
    // VALIDAÇÃO E SUBMISSÃO
    // ============================================================
    submitBtn.addEventListener('click', () => {
        const courseValue = courseInput.value.trim();

        // Validações básicas de preenchimento
        if (!courseValue) { showError("Por favor, digite o nome do curso!"); return; }

        if (!userSelection.shift || !userSelection.period) {
            showError("Por favor, selecione o turno e o período.");
            return;
        }

        // Validação de Curso Permitido (Hardcoded MVP)
        const isSistemas = ALLOWED_COURSES.includes(courseValue);
        if (!isSistemas) {
            showError(`No momento, apenas o curso "Sistemas para Internet" está disponível.`);
            return;
        }

        // Validação de Grade Específica (Regra de Negócio Temporária)
        if (isSistemas) {
            const periodo = parseInt(userSelection.period);

            // 1. Trava de Período (Sistemas só vai até o 6º)
            if (periodo > 6) {
                showError(`O curso de Sistemas só vai até o 6º período!`);
                return;
            }
        }

        // Persistência e Redirecionamento
        userSelection.course = courseValue;
        localStorage.setItem('mqs_user_data', JSON.stringify(userSelection));
        window.location.href = 'grade.html';
    });

    /**
     * Atualiza o estado visual (classe 'active') de um grupo de botões.
     * @param {NodeList} nodeList - Lista de elementos DOM a serem iterados.
     * @param {string} value - O valor selecionado atualmente.
     */
    function updateVisuals(nodeList, value) {
        nodeList.forEach(btn => {
            if (btn.getAttribute('data-value') === value) {
                btn.classList.add('active');
            } else { btn.classList.remove('active'); }
        });
    }

    /**
     * Exibe feedback visual de erro e aplica animação de "shake".
     * @param {string} message - Mensagem a ser exibida.
     */
    function showError(message) {
        feedbackMsg.innerHTML = `<span class="material-symbols-rounded">error</span> ${message}`;
        feedbackMsg.classList.remove('hidden');
        courseInput.style.borderColor = '#C62828';
        form.classList.add('shake-anim');
        setTimeout(() => form.classList.remove('shake-anim'), 500);
    }

    // ============================================================
    // FUNCIONALIDADE: DICA DO DIA
    // ============================================================
    if (savedData || localStorage.getItem('mqs_custom_grid')) {
        // Fetch em arquivo local para garantir funcionamento offline/PWA
        fetch('tip_of_day.json')
            .then(response => {
                if (!response.ok) throw new Error('Erro ao ler dicas');
                return response.json();
            })
            .then(data => {
                const randomTip = data.tips[Math.floor(Math.random() * data.tips.length)];
                tipTextElement.textContent = `"${randomTip}"`;
            })
            .catch(err => {
                console.warn('Fallback de dica ativado:', err);
                tipTextElement.textContent = "Mantenha o foco e beba água!";
            });
    }

    // ============================================================
    // LISTENERS DE NAVEGAÇÃO E UX
    // ============================================================
    if (scrollContainer && btnLeft && btnRight) {
        btnLeft.addEventListener('click', () => scrollContainer.scrollBy({ left: -200, behavior: 'smooth' }));
        btnRight.addEventListener('click', () => scrollContainer.scrollBy({ left: 200, behavior: 'smooth' }));

        scrollContainer.addEventListener('scroll', updateMiniArrows);
        window.addEventListener('resize', updateMiniArrows);

        // Verificações em múltiplos momentos para garantir renderização correta
        updateMiniArrows();
        setTimeout(updateMiniArrows, 100);
        setTimeout(updateMiniArrows, 500);
        window.addEventListener('load', updateMiniArrows);
    }

    /**
     * Fix para UX Mobile: Retorna o scroll ao topo quando o teclado virtual fecha.
     * Evita que o layout fique "quebrado" ou deslocado em dispositivos iOS/Android.
     */
    const allInputs = document.querySelectorAll('input');

    allInputs.forEach(input => {
        input.addEventListener('blur', () => {
            setTimeout(() => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }, 200);
        });
    });
});