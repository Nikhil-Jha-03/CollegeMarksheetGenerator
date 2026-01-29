package com.nikhil.backend.controller;

import org.springframework.web.bind.annotation.RestController;

import com.nikhil.backend.dto.LCResponseDTO;
import com.nikhil.backend.dto.LeavingCertificateDTO;
import com.nikhil.backend.dto.PageResponse;
import com.nikhil.backend.entity.LeavingCertificate;
import com.nikhil.backend.payload.ApiResponse;
import com.nikhil.backend.repository.LeavingCertificateRepository;
import com.nikhil.backend.services.LeavingCertificateService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/leavingcertificate")
@Slf4j
public class LeavingCertificateController {

    @Autowired
    public LeavingCertificateService leavingCertificateService;

    @Autowired
    private LeavingCertificateRepository leavingCertificateRepository;

    @PostMapping("/createLC")
    public ResponseEntity<ApiResponse<Void>> postMethodName(@RequestBody LeavingCertificateDTO entity) {
        // TODO: process POST request
        System.out.println("Inside LeavingCertificateController createLC" + entity);
        return ResponseEntity.ok().body(leavingCertificateService.createLC(entity));
    }

    @GetMapping("/getAllLC")
    public ResponseEntity<ApiResponse<List<LCResponseDTO>>> getMethodName() {
        return ResponseEntity.ok().body(leavingCertificateService.getAllLC());
    }

    @DeleteMapping("/deleteLC/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLC(@PathVariable Long id) {
        return ResponseEntity.ok().body(leavingCertificateService.deleteLC(id));
    }

    @GetMapping("/downloadLC/{param}")
    public ResponseEntity<byte[]> getMethodName(@PathVariable String param) {
        try {

            Long id = Long.parseLong(param);
            LeavingCertificate lc = leavingCertificateRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("LC not found for id: " + id));

            byte[] pdfBytes = leavingCertificateService.downloadLC(id);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("filename",
                    "LC_" + param + ".pdf");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/searchLC")
    public ResponseEntity<ApiResponse<PageResponse<LCResponseDTO>>> searchLC(@RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "5") int size,
            @RequestParam(required = false,defaultValue = "") String search) {


        return ResponseEntity.ok().body(leavingCertificateService.searchLC(search, PageRequest.of(page, size)));
    }

}