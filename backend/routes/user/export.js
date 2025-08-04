const express = require('express');
const { stringify } = require('csv-stringify/sync');
const PDFDocument = require('pdfkit');
const router = express.Router();

module.exports = (models, authenticateToken) => {
  const { Transaction, Account, Category, Budget } = models;

  router.get('/csv', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const transactions = await Transaction.findAll({ where: { UserId: userId }, include: [Account, Category] });
      const records = transactions.map(t => ({
        date: t.date,
        amount: t.amount,
        type: t.type,
        description: t.description,
        account: t.Account ? t.Account.name : '',
        category: t.Category ? t.Category.name : ''
      }));
      const csv = stringify(records, { header: true });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
      res.send(csv);
    } catch (err) {
      res.status(500).json({ message: 'Failed to export CSV', error: err.message });
    }
  });

  router.get('/pdf', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const [transactions, accounts, categories] = await Promise.all([
        Transaction.findAll({ where: { UserId: userId }, include: [Account, Category] }),
        Account.findAll({ where: { UserId: userId } }),
        Category.findAll({ where: { UserId: userId } })
      ]);

      let totalIncome = 0, totalExpense = 0;
      transactions.forEach(t => {
        if (t.type === 'income') totalIncome += parseFloat(t.amount);
        if (t.type === 'expense') totalExpense += parseFloat(t.amount);
      });
      const netIncome = totalIncome - totalExpense;

      const doc = new PDFDocument({ margin: 40 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="exported_data.pdf"');
      doc.pipe(res);

      function tableHeader(doc, headers, y) {
        doc.font('Helvetica-Bold').fontSize(12);
        headers.forEach((header, i) => {
          doc.text(header, 50 + i * 120, y, { width: 120, align: 'left' });
        });
        doc.moveDown();
        doc.font('Helvetica').fontSize(11);
      }

      doc.fontSize(18).font('Helvetica-Bold').text('Transactions', { align: 'center' });
      doc.moveDown(0.5);
      tableHeader(doc, ['Date', 'Amount', 'Type', 'Account', 'Category', 'Description'], doc.y);
      transactions.forEach(t => {
        doc.text(t.date, 50, doc.y, { width: 120 });
        doc.text(t.amount, 170, doc.y, { width: 120 });
        doc.text(t.type, 290, doc.y, { width: 120 });
        doc.text(t.Account ? t.Account.name : '', 410, doc.y, { width: 120 });
        doc.text(t.Category ? t.Category.name : '', 530, doc.y, { width: 120 });
        doc.text(t.description, 650, doc.y, { width: 120 });
        doc.moveDown();
      });
      doc.addPage();

      doc.fontSize(18).font('Helvetica-Bold').text('Accounts', { align: 'center' });
      doc.moveDown(0.5);
      tableHeader(doc, ['Name', 'Type', 'Balance', 'Currency', 'Description'], doc.y);
      accounts.forEach(a => {
        doc.text(a.name, 50, doc.y, { width: 120 });
        doc.text(a.type, 170, doc.y, { width: 120 });
        doc.text(a.balance, 290, doc.y, { width: 120 });
        doc.text(a.currency, 410, doc.y, { width: 120 });
        doc.text(a.description, 530, doc.y, { width: 200 });
        doc.moveDown();
      });
      doc.addPage();

      doc.fontSize(18).font('Helvetica-Bold').text('Categories', { align: 'center' });
      doc.moveDown(0.5);
      tableHeader(doc, ['Name', 'Type', 'Color', 'Description'], doc.y);
      categories.forEach(c => {
        doc.text(c.name, 50, doc.y, { width: 120 });
        doc.text(c.type, 170, doc.y, { width: 120 });
        doc.text(c.color, 290, doc.y, { width: 120 });
        doc.text(c.description, 410, doc.y, { width: 320 });
        doc.moveDown();
      });
      doc.addPage();

      doc.fontSize(18).font('Helvetica-Bold').text('Reports & Analytics', { align: 'center' });
      doc.moveDown(1);
      doc.font('Helvetica-Bold').fontSize(14).text('Summary', { underline: true });
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(12).text(`Total Income: `, { continued: true }).font('Helvetica-Bold').text(`${totalIncome}`);
      doc.font('Helvetica').fontSize(12).text(`Total Expense: `, { continued: true }).font('Helvetica-Bold').text(`${totalExpense}`);
      doc.font('Helvetica').fontSize(12).text(`Net Income: `, { continued: true }).font('Helvetica-Bold').text(`${netIncome}`);

      doc.end();
    } catch (err) {
      res.status(500).json({ message: 'Failed to export PDF', error: err.message });
    }
  });

  return router;
}; 