package com.infosys.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.infosys.entity.Bill;
import com.infosys.service.BillService;

@Controller
@CrossOrigin(origins= {"*"})
public class BillController {

	@Autowired BillService billService;
	@PostMapping("/home/bill/add")
public ResponseEntity<String> addBill(@RequestBody Bill bill) {
    try {
        Bill response = billService.addBill(bill);
        return new ResponseEntity<>("Bill added successfully", HttpStatus.OK);
    } catch (Exception e) {
        return new ResponseEntity<>("Failed to add bill: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

@GetMapping("/home/bill")
public ResponseEntity<List<Bill>> retrieveBills(@RequestParam String username) {
    try {
        List<Bill> response = billService.retrieveBills(username);
        if (!response.isEmpty()) {
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(List.of(), HttpStatus.OK); // Empty list if no bills found
        }
    } catch (Exception e) {
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
}