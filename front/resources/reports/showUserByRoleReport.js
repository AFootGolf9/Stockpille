function showUserByRoleReport() {
  const reportHTML = `
    <h2>Relatório de Usuários por Função (Role)</h2>
    <div id="user-by-role-report-result">
      <p>Carregando relatório...</p>
    </div>
    <div id="button-container" style="margin-top: 15px;">
      <button id="generate-pdf" onclick="generateUserByRolePDF()">Gerar PDF</button>
      <button onclick="showReportMenu()" style="margin-left: 10px;">Voltar</button>
    </div>
  `;

  document.getElementById('main-content').innerHTML = reportHTML;

  fetch('http://localhost:8080/rel/userbyrole', {
    headers: {
      "Authorization": getCookie("token")
    }
  })
  .then(res => {
    if (!res.ok) throw new Error(`Erro ${res.status} ao carregar relatório`);
    return res.json();
  })
  .then(data => {
    if (data && Object.keys(data).length > 0) {
      let tableHTML = `
        <table class="allocations-table" border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
          <thead style="background-color: #16a085; color: white;">
            <tr>
              <th>Função (Role)</th>
              <th>Quantidade de Usuários</th>
            </tr>
          </thead>
          <tbody>
      `;

      for (const roleName in data) {
        tableHTML += `
          <tr>
            <td>${roleName}</td>
            <td>${data[roleName]}</td>
          </tr>
        `;
      }

      tableHTML += `</tbody></table>`;

      document.getElementById('user-by-role-report-result').innerHTML = tableHTML;
    } else {
      document.getElementById('user-by-role-report-result').innerHTML = "<p>Nenhum dado encontrado.</p>";
    }
  })
  .catch(err => {
    console.error('Erro ao carregar relatório:', err);
    document.getElementById('user-by-role-report-result').innerHTML = `<p>Falha ao carregar relatório: ${err.message}</p>`;
  });
}

function generateUserByRolePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Relatório de Usuários por Função (Role)", 14, 20);

  const table = document.querySelector(".allocations-table");
  if (table) {
    const rows = table.querySelectorAll("tr");
    const tableData = [];

    rows.forEach((row, index) => {
      const cells = row.querySelectorAll("td, th");
      const rowData = [];
      cells.forEach(cell => {
        rowData.push(cell.textContent);
      });
      if (index !== 0) { // Ignora o cabeçalho para o corpo
        tableData.push(rowData);
      }
    });

    doc.autoTable({
      head: [["Função (Role)", "Quantidade de Usuários"]],
      body: tableData,
      startY: 30,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 12,
        cellPadding: 5,
        valign: 'middle',
      },
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: 255,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fillColor: [242, 242, 242],
        textColor: 0,
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255],
      },
    });

    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(10);
    doc.setFont("helvetica");
    doc.text(`Página ${pageCount}`, 180, 285);

    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("StockPille", 10, pageHeight - 10);
  }

  doc.save("relatorio_usuarios_por_funcao.pdf");
}
