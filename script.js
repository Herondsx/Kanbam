document.addEventListener('DOMContentLoaded', function () {
    const weldscannerApp = document.getElementById('weldscanner-app');
    if (weldscannerApp) {
        // --- Navegação por Abas ---
        const navLinks = weldscannerApp.querySelectorAll('.nav-link');
        const tabContents = weldscannerApp.querySelectorAll('.tab-content');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                const tabId = link.dataset.tab;
                navLinks.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.add('hidden'));
                link.classList.add('active');
                weldscannerApp.querySelector(`#${tabId}-content`).classList.remove('hidden');
            });
        });

        // --- Lógica de Pesquisa na Tabela de Backup ---
        const backupSearchInput = document.getElementById('backup-search-input');
        const backupSearchSelect = document.getElementById('backup-search-select');
        const backupTableBody = document.getElementById('backup-table-body');
        if (backupSearchInput && backupSearchSelect && backupTableBody) {
            const filterTable = () => {
                const searchTerm = backupSearchInput.value.toLowerCase();
                const searchColumnIndex = parseInt(backupSearchSelect.value, 10);
                const rows = backupTableBody.querySelectorAll('tr');

                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    let textToSearch = '';

                    if (searchColumnIndex === -1) { // Pesquisar em Tudo
                        cells.forEach(cell => {
                            textToSearch += cell.textContent.toLowerCase() + ' ';
                        });
                    } else {
                        if (cells[searchColumnIndex]) {
                            textToSearch = cells[searchColumnIndex].textContent.toLowerCase();
                        }
                    }

                    if (textToSearch.includes(searchTerm)) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            };
            backupSearchInput.addEventListener('input', filterTable);
            backupSearchSelect.addEventListener('change', filterTable);
        }


        // --- Lógica de Projetos ---
        const addProjectBtn = document.getElementById('add-project-btn');
        const projectsList = document.getElementById('projects-list');
        const currentProjectName = document.getElementById('current-project-name');
        const modal = document.getElementById('create-project-modal');
        const newProjectNameInput = document.getElementById('new-project-name');
        const confirmProjectBtn = document.getElementById('confirm-project-btn');
        const cancelProjectBtn = document.getElementById('cancel-project-btn');

        // Mostrar/Esconder Modal
        addProjectBtn.addEventListener('click', () => modal.classList.remove('hidden'));
        cancelProjectBtn.addEventListener('click', () => modal.classList.add('hidden'));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });

        // Criar novo projeto a partir do modal
        confirmProjectBtn.addEventListener('click', () => {
            const projectName = newProjectNameInput.value.trim();
            if (projectName) {
                createNewProject(projectName);
                newProjectNameInput.value = '';
                modal.classList.add('hidden');
            } else {
                alert('Por favor, digite um nome para o projeto.');
            }
        });
        
        // Função para criar a hierarquia de backup (simulação)
        const createBackupHierarchy = () => {
            const hierarchy = { 'BACKUP_2025': { 'ROBOTS': { 'R01': ['R01_VW002_OP30A.ls', 'R01_CONFIG.dat'], 'R02': ['R02_VW002_OP40B.ls'] }, 'SYSTEM': ['SYS_CONFIG.xml'] } };
            const createTreeHtml = (data) => {
                let html = '<ul class="pl-5 border-l-2 border-gray-700 ml-2.5 space-y-1">';
                for (const key in data) {
                    const isFolder = typeof data[key] === 'object' && !Array.isArray(data[key]);
                    if (isFolder) {
                        html += `<li><div class="flex items-center gap-2 cursor-pointer tree-item-toggle p-1 rounded hover:bg-gray-700"><svg class="w-4 h-4 chevron-icon flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg><svg class="w-5 h-5 text-yellow-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg><span>${key}</span></div><div class="hidden">${createTreeHtml(data[key])}</div></li>`;
                    } else if (Array.isArray(data[key])) {
                        data[key].forEach(file => { html += `<li class="flex items-center gap-2 p-1"><svg class="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg><span class="text-gray-400">${file}</span></li>`; });
                    }
                }
                return html + '</ul>';
            };
            return createTreeHtml(hierarchy);
        };

        const createNewProject = (projectName) => {
            const projectLi = document.createElement('li');
            projectLi.className = 'project-item';
            projectLi.dataset.projectName = projectName;
            projectLi.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2 cursor-pointer tree-item-toggle p-1 rounded hover:bg-gray-700 flex-1">
                        <svg class="w-4 h-4 chevron-icon flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        <svg class="w-5 h-5 text-yellow-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                        <span class="font-semibold project-name-span">${projectName}</span>
                    </div>
                </div>
                <div class="project-content pl-5 pt-2 border-l-2 border-gray-700 ml-2.5 hidden">
                    <button class="load-backup-btn text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-md mb-2">Carregar Backup</button>
                    <ul class="backup-tree space-y-1 hidden"></ul>
                </div>
            `;
            projectsList.appendChild(projectLi);
        };
        
        // Event Delegation para toda a lista de projetos
        projectsList.addEventListener('click', (e) => {
            const toggle = e.target.closest('.tree-item-toggle');
            const loadBtn = e.target.closest('.load-backup-btn');

            if (toggle) {
                const content = toggle.closest('li').querySelector('.project-content, ul');
                if(content) content.classList.toggle('hidden');
                toggle.classList.toggle('open');
                const projectItem = toggle.closest('.project-item');
                if(projectItem) currentProjectName.textContent = projectItem.dataset.projectName;
            }

            if (loadBtn) {
                const backupTree = loadBtn.nextElementSibling;
                backupTree.innerHTML = createBackupHierarchy();
                backupTree.classList.remove('hidden');
                loadBtn.textContent = 'Backup Carregado';
                loadBtn.disabled = true;
                loadBtn.classList.add('bg-gray-500', 'cursor-not-allowed');
            }
        });

        // Editar nome do projeto com duplo clique
        projectsList.addEventListener('dblclick', (e) => {
            const span = e.target.closest('.project-name-span');
            if (!span) return;

            const li = span.closest('.project-item');
            const originalName = span.textContent;
            const input = document.createElement('input');
            input.type = 'text';
            input.value = originalName;
            input.className = 'bg-gray-800 text-white w-full rounded px-1 -ml-1 focus:outline-none focus:ring-2 focus:ring-blue-500';
            
            span.replaceWith(input);
            input.focus();
            input.select();

            const finishEditing = (save) => {
                const newName = input.value.trim();
                if (save && newName) {
                    span.textContent = newName;
                    li.dataset.projectName = newName;
                    if (currentProjectName.textContent === originalName) {
                        currentProjectName.textContent = newName;
                    }
                } else {
                    span.textContent = originalName;
                }
                input.replaceWith(span);
            };

            input.addEventListener('blur', () => finishEditing(true));
            input.addEventListener('keydown', (evt) => {
                if (evt.key === 'Enter') finishEditing(true);
                else if (evt.key === 'Escape') finishEditing(false);
            });
        });
    }
});
