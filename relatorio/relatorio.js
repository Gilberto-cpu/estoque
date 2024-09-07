document.addEventListener('DOMContentLoaded', () => {
    loadReports();
});

function addReport() {
    // Obtém os valores dos campos de entrada do formulário
    const date = document.getElementById('date').value;
    const name = document.getElementById('name').value;
    const time = document.getElementById('time').value;
    const report = document.getElementById('report').value;

    // Verifica se todos os campos estão preenchidos
    if (date && name && time && report) {
        const reportContainer = document.getElementById('reportsContainer');

        // Cria um novo elemento de relatório
        const reportElement = createReportElement(date, name, time, report);

        // Adiciona o elemento de relatório ao container
        reportContainer.appendChild(reportElement);

        // Salva o relatório no armazenamento local
        saveReport(date, name, time, report);

        // Limpa os campos do formulário após adicionar o relatório
        document.getElementById('reportForm').reset();
        
        // Exibe uma mensagem de sucesso
        alert('Relatório adicionado com sucesso.');
    } else {
        // Exibe uma mensagem de erro se algum campo estiver vazio
        alert('Preencha todos os campos obrigatórios.');
    }
}

function createReportElement(date, name, time, report) {
    const reportElement = document.createElement('div');
    reportElement.classList.add('report');

    const formattedDate = formatDate(date); // Formata a data

    // Cria elementos de parágrafo para cada informação e adiciona ao relatório
    const dateElement = document.createElement('p');
    dateElement.textContent = `Data: ${formattedDate}`;
    reportElement.appendChild(dateElement);

    const nameElement = document.createElement('p');
    nameElement.textContent = `Nome: ${name}`;
    reportElement.appendChild(nameElement);

    const timeElement = document.createElement('p');
    timeElement.textContent = `Horário: ${time}`;
    reportElement.appendChild(timeElement);

    const reportTextElement = document.createElement('p');
    reportTextElement.textContent = `Relatório: ${report}`;
    reportElement.appendChild(reportTextElement);

    // Cria um botão para deletar o relatório e adiciona funcionalidade de clique
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Deletar';
    deleteButton.classList.add('delete-btn');
    deleteButton.onclick = function() {
        const reportContainer = document.getElementById('reportsContainer');
        reportContainer.removeChild(reportElement);
        deleteReport(date, name, time, report);
        alert('Relatório deletado com sucesso.');
    };
    reportElement.appendChild(deleteButton);

    return reportElement;
}

function saveReport(date, name, time, report) {
    // Recupera os relatórios existentes do armazenamento local e adiciona o novo relatório
    let reports = JSON.parse(localStorage.getItem('reports')) || [];
    reports.push({ date, name, time, report });
    localStorage.setItem('reports', JSON.stringify(reports));
}

function loadReports() {
    // Carrega todos os relatórios do armazenamento local e os adiciona ao container
    const reports = JSON.parse(localStorage.getItem('reports')) || [];
    const reportContainer = document.getElementById('reportsContainer');

    reports.forEach(({ date, name, time, report }) => {
        const reportElement = createReportElement(date, name, time, report);
        reportContainer.appendChild(reportElement);
    });
}

function deleteReport(date, name, time, report) {
    // Remove o relatório especificado do armazenamento local
    let reports = JSON.parse(localStorage.getItem('reports')) || [];
    reports = reports.filter(r => !(r.date === date && r.name === name && r.time === time && r.report === report));
    localStorage.setItem('reports', JSON.stringify(reports));
}

function formatDate(dateString) {
    // Formata a data no padrão dd/mm/yyyy
    const dateObj = new Date(dateString);
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
}

