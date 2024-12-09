package com.infosys.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.math.BigDecimal;

@Entity
public class Card {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String username;

    @Column(name = "accountNumber", unique = true, nullable = false)
    private String accountNumber;

    private String cardHolder;

    private String expiryDate;

    private String cvv;

    @Column(precision = 10, scale = 2) // Example of precision and scale for currency
    private BigDecimal amount;

    // Default constructor
    public Card() {
        super();
    }

    // Parameterized constructor
    public Card(int id, String username, String accountNumber, String cardHolder, String expiryDate, String cvv, BigDecimal amount) {
        super();
        this.id = id;
        this.username = username;
        this.accountNumber = accountNumber;
        this.cardHolder = cardHolder;
        this.expiryDate = expiryDate;
        this.cvv = cvv;
        this.amount = amount;
    }

    // Getters and setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getCardHolder() {
        return cardHolder;
    }

    public void setCardHolder(String cardHolder) {
        this.cardHolder = cardHolder;
    }

    public String getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(String expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getCvv() {
        return cvv;
    }

    public void setCvv(String cvv) {
        this.cvv = cvv;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    @Override
    public String toString() {
        return "Card [id=" + id + ", username=" + username + ", accountNumber=" + accountNumber + ", cardHolder=" + cardHolder
                + ", expiryDate=" + expiryDate + ", cvv=" + cvv + ", amount=" + amount + "]";
    }
}
