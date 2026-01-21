document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENTOS DO DOM ---
    const form = document.getElementById('selection-form');
    const warmDiv = document.getElementById('warm-welcome');
    
    // Elementos do Warm Start
    const savedCourse = document.getElementById('saved-course');
    const savedDetails = document.getElementById('saved-details');
    const quickBtn = document.getElementById('btn-quick-access');
    const resetBtn = document.getElementById('btn-reset-app');
    
    // Elementos do Formulário
    const courseInput = document.getElementById('course-input');
    const shiftBtns = document.querySelectorAll('.segment-btn');
    const periodBtns = document.querySelectorAll('.chip-btn');
    const submitBtn = document.getElementById('btn-ver-horarios');
    const feedbackMsg = document.getElementById('form-feedback');

    // Estado Inicial do Formulário
    let userSelection = { course: '', shift: 'matutino', period: '2' };

    // 🔒 1. LISTA DE CURSOS PERMITIDOS (Whitelist)
    const ALLOWED_COURSES = [
        "Sistemas para Internet",
        "sistemas para internet", 
        "Sistemas Para Internet"
    ];

    // ============================================================
    // LÓGICA DE START
    // ============================================================
    const savedData = localStorage.getItem('mqs_user_data');

    if (savedData) {
        const data = JSON.parse(savedData);
        form.classList.add('hidden');
        warmDiv.classList.remove('hidden');
        
        savedCourse.textContent = data.course;
        const shiftFormatted = data.shift.charAt(0).toUpperCase() + data.shift.slice(1);
        savedDetails.textContent = `${data.period}º Período • ${shiftFormatted}`;

    } else {
        warmDiv.classList.add('hidden');
        form.classList.remove('hidden');
    }

    // ============================================================
    // INTERAÇÃO
    // ============================================================
    
    quickBtn.addEventListener('click', () => {
        window.location.href = 'grade.html';
    });

    resetBtn.addEventListener('click', () => {
        localStorage.removeItem('mqs_user_data');
        warmDiv.classList.add('hidden');
        form.classList.remove('hidden');
        courseInput.value = ''; 
        feedbackMsg.classList.add('hidden');
    });

    // Seleção de Turno
    shiftBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            userSelection.shift = btn.getAttribute('data-value');
            updateVisuals(shiftBtns, userSelection.shift);
        });
    });

    // Seleção de Período
    periodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            userSelection.period = btn.getAttribute('data-value');
            updateVisuals(periodBtns, userSelection.period);
        });
    });

    // ============================================================
    // 🛡️ VALIDAÇÃO RIGOROSA (SUBMIT)
    // ============================================================
    submitBtn.addEventListener('click', () => {
        const courseValue = courseInput.value.trim();

        // 1. Validação: Campo Vazio
        if (!courseValue) {
            showError("Por favor, digite o nome do curso!");
            return;
        }

        // 2. Validação: Curso Existe?
        const isSistemas = ALLOWED_COURSES.includes(courseValue);
        
        if (!isSistemas) {
            showError(`O curso "${courseValue}" estará disponível em breve!`);
            return;
        }

        // 3. Validação: Combinação Exata (SÓ TEMOS 2º MATUTINO)
        // Se for Sistemas, MAS o turno ou período estiverem errados:
        if (isSistemas) {
            const isMatutino = userSelection.shift === 'matutino';
            const isSegundoPeriodo = userSelection.period === '2';

            if (!isMatutino || !isSegundoPeriodo) {
                // Formata mensagem bonita
                const turnoEscolhido = userSelection.shift.charAt(0).toUpperCase() + userSelection.shift.slice(1);
                showError(`A grade de ${userSelection.period}º Período ${turnoEscolhido} ainda não foi cadastrada. Apenas 2º Matutino disponível.`);
                return;
            }
        }

        // SUCESSO: Passou por todas as barreiras
        userSelection.course = courseValue;
        localStorage.setItem('mqs_user_data', JSON.stringify(userSelection));
        window.location.href = 'grade.html';
    });

    // Funções Auxiliares
    function updateVisuals(nodeList, value) {
        nodeList.forEach(btn => {
            if (btn.getAttribute('data-value') === value) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    function showError(message) {
        feedbackMsg.textContent = message;
        feedbackMsg.classList.remove('hidden');
        courseInput.style.borderColor = '#C62828';
        
        // Se o erro for de seleção (não de digitação), destaca o form inteiro visualmente
        form.classList.add('shake-anim');
        setTimeout(() => form.classList.remove('shake-anim'), 500);
    }

    // ============================================================
    // REQUISITO: DICA DO DIA
    // ============================================================
    const tipElement = document.getElementById('daily-tip-text');
    
    fetch('https://api.quotable.io/random?tags=technology,wisdom&maxLength=60')
        .then(response => {
            if (!response.ok) throw new Error('Falha na rede');
            return response.json();
        })
        .then(data => {
            tipElement.textContent = `💡 "${data.content}"`;
        })
        .catch(error => {
            tipElement.textContent = "💡 Dica: Mantenha o foco e beba água!";
        });
});