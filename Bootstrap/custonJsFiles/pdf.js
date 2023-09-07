const search = document.querySelector(".input-group input"),
  table_rows = document.querySelectorAll("tbody tr"),
  table_headings = document.querySelectorAll("thead th");


// 3. Converting HTML table to PDF

const pdf_btn = document.querySelector("#toPDF");
console.log(pdf_btn);
const customers_table = document.querySelector("#customers_table");

const toPDF = function (customers_table) {
  const html_code = `
    <link rel="stylesheet" href="style.css">
    <main class="table" >${customers_table.innerHTML}</main>
    `;

  const new_window = window.open();
  new_window.document.write(html_code);

  setTimeout(() => {
    new_window.print();
    new_window.close();
  }, 400);
};

pdf_btn.onclick = () => {
  toPDF(customers_table);
};







const downloadFile = function (data, fileType, fileName = "") {
  const a = document.createElement("a");
  a.download = fileName;
  const mime_types = {
    json: "application/json",
    csv: "text/csv",
    excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
  a.href = `
        data:${mime_types[fileType]};charset=utf-8,${encodeURIComponent(data)}
    `;
  document.body.appendChild(a);
  a.click();
  a.remove();
};
