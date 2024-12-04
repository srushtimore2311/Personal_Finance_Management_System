package com.infosys.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.entity.Transaction;
import com.infosys.service.TransactionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@CrossOrigin(origins = {"*"})
public class TransactionController {

    private static final Logger logger = LoggerFactory.getLogger(TransactionController.class);

    @Autowired
    private TransactionService tranService;

    @PostMapping("/home/transaction/add")
    public ResponseEntity<String> addTransaction(@RequestBody Transaction transaction) {
        try {
            logger.info("Received transaction request: {}", transaction);
            tranService.addTransaction(transaction);
            return new ResponseEntity<>("New Transaction added Successfully", HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error occurred while adding transaction: {}", e.getMessage());
            return new ResponseEntity<>("Failed to add Transaction", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/home/transaction")
    public ResponseEntity<List<Transaction>> showUserTransaction(@RequestParam String username) {
        try {
            List<Transaction> transactions = tranService.showUserTransaction(username);
            if (transactions.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(transactions, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error occurred while fetching transactions for username {}: {}", username, e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
