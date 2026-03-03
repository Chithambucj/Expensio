package com.expense.tracker.controller;

import com.expense.tracker.model.Transaction;
import com.expense.tracker.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;
import java.io.InputStream;

import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:4200")
public class TransactionController {

    @Autowired
    private com.expense.tracker.service.TransactionService transactionService;

    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionService.getAllTransactions();
    }

    @PostMapping
    public Transaction createTransaction(@RequestBody Transaction transaction) {
        return transactionService.createTransaction(transaction);
    }

    @PutMapping("/{id}")
    public Transaction updateTransaction(@PathVariable String id, @RequestBody Transaction transaction) {
        return transactionService.updateTransaction(id, transaction);
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadTransactions(@RequestParam("file") MultipartFile file) {
        try (InputStream is = file.getInputStream();
                Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            List<Transaction> transactions = new ArrayList<>();
            DataFormatter dataFormatter = new DataFormatter();

            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                return ResponseEntity.badRequest().body("Excel file is empty or missing headers");
            }

            // Map column names to indices
            Map<String, Integer> colMap = new HashMap<>();
            for (int j = 0; j < headerRow.getLastCellNum(); j++) {
                Cell cell = headerRow.getCell(j);
                if (cell != null) {
                    colMap.put(dataFormatter.formatCellValue(cell).trim().toLowerCase(), j);
                }
            }

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null)
                    continue;

                Transaction t = new Transaction();
                t.setId(UUID.randomUUID().toString());

                String date = getCellValue(row, colMap, "date", dataFormatter);
                t.setDate(date != null && !date.isEmpty() ? date : java.time.Instant.now().toString());

                t.setCategory(getCellValue(row, colMap, "category", dataFormatter));

                String subCat = getCellValue(row, colMap, "sub category", dataFormatter);
                if (subCat == null || subCat.isEmpty())
                    subCat = getCellValue(row, colMap, "subcategory", dataFormatter);
                t.setSubCategory(subCat);

                String catDet = getCellValue(row, colMap, "category detail", dataFormatter);
                if (catDet == null || catDet.isEmpty())
                    catDet = getCellValue(row, colMap, "categorydetail", dataFormatter);
                t.setCategoryDetail(catDet);

                String descDet = getCellValue(row, colMap, "description detail", dataFormatter);
                if (descDet == null || descDet.isEmpty())
                    descDet = getCellValue(row, colMap, "descriptiondetail", dataFormatter);
                t.setDescriptionDetail(descDet);

                t.setDescription(getCellValue(row, colMap, "description", dataFormatter));

                String amountStr = getCellValue(row, colMap, "amount", dataFormatter);
                double amount = 0.0;
                if (amountStr != null && !amountStr.isEmpty()) {
                    try {
                        amount = Double.parseDouble(amountStr.replace(",", ""));
                    } catch (NumberFormatException e) {
                        // ignore
                    }
                }

                String type = getCellValue(row, colMap, "type", dataFormatter);
                if (amount > 0 && !"income".equalsIgnoreCase(type)) {
                    amount = -amount;
                }

                t.setAmount(amount);
                t.setType(type == null || type.isEmpty() ? "expense" : type.toLowerCase());

                String paymentMode = getCellValue(row, colMap, "payment mode", dataFormatter);
                if (paymentMode == null || paymentMode.isEmpty())
                    paymentMode = getCellValue(row, colMap, "paymentmode", dataFormatter);
                t.setPaymentMode(paymentMode != null && !paymentMode.isEmpty() ? paymentMode : "Cash");

                transactions.add(t);
            }

            transactionService.saveAll(transactions);
            return ResponseEntity.ok().body("Imported " + transactions.size() + " transactions");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to parse file: " + e.getMessage());
        }
    }

    private String getCellValue(Row row, Map<String, Integer> colMap, String colName, DataFormatter dataFormatter) {
        Integer index = colMap.get(colName);
        if (index != null) {
            Cell cell = row.getCell(index);
            return dataFormatter.formatCellValue(cell);
        }
        return "";
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable String id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.ok().build();
    }
}
