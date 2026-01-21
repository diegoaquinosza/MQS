document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENTOS ---
    const shiftBtns = document.querySelectorAll('.segment-btn');
    const periodBtns = document.querySelectorAll('.chip-btn');
    const courseInput = document.getElementById('course-input');
    const submitBtn = document.getElementById('btn-ver-horarios');

    // --- ESTADO (Armazena as escolhas) ---
    let userSelection = {
        course: '',
        shift: 'matutino', // Valor padrão
        period: '2'        // Valor padrão
    };

    // 1. Carregar dados salvos (Se o aluno já veio aqui antes)
    const savedData = localStorage.getItem('mqs_user_data');
    if (savedData) {
        userSelection = JSON.parse(savedData);
        
        // Atualiza UI
        courseInput.value = userSelection.course;
        updateActiveState(shiftBtns, userSelection.shift);
        updateActiveState(periodBtns, userSelection.period);
    }

    // 2. Lógica dos Botões de Turno (Segmented)
    shiftBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const value = btn.getAttribute('data-value');
            userSelection.shift = value;
            
            // Visual
            shiftBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // 3. Lógica dos Chips de Período
    periodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const value = btn.getAttribute('data-value');
            userSelection.period = value;
            
            // Visual
            periodBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // 4. Ação Final: Ver Horários
    submitBtn.addEventListener('click', () => {
        const courseValue = courseInput.value.trim();

        if (!courseValue) {
            alert("Ei, mano! Esqueceu de colocar o curso!");
            courseInput.focus();
            return;
        }

        userSelection.course = courseValue;

        // Salva no LocalStorage (Para a próxima vez)
        localStorage.setItem('mqs_user_data', JSON.stringify(userSelection));

        // --- NAVEGAÇÃO ---
        // Aqui conectamos com a grade que você já tem.
        // Certifique-se que o arquivo da grade se chama 'grade.html'
        window.location.href = 'grade.html';
    });

    // Função auxiliar para marcar botões ativos ao carregar
    function updateActiveState(nodeList, value) {
        nodeList.forEach(btn => {
            if (btn.getAttribute('data-value') === value) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
});