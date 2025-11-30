package com.nikhil.backend.controller;

import java.time.LocalDate;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.nikhil.backend.dto.FinalStudentDetailDTO;
import com.nikhil.backend.services.PdfGenerationService;
import com.nikhil.backend.services.StudentService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/student")
public class PdfGenerationController {

    private final PdfGenerationService pdfGenerationService;
    private final StudentService studentService;


    @GetMapping("/pdf/{grNo}")
    public ResponseEntity<byte[]> generateStudentReportPdf(@PathVariable Long grNo) {
        try {
            // Fetch student data from database
            FinalStudentDetailDTO student = studentService.getStudentByGrNo(grNo);

            if (student == null) {
                return ResponseEntity.notFound().build();
            }


            // Generate PDF
            byte[] pdfBytes = pdfGenerationService.generateStudentReportDirect(student);
            System.out.println(pdfBytes.toString());

            // Set headers for PDF download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment",
                    "Report_Card_" + student.getName() + "_" + grNo + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
            // return null;

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/pdf/all")
    public ResponseEntity<byte[]> generateAllStudentPdfs() {
        try {

            // Generate ZIP file
            byte[] zipBytes = pdfGenerationService.generateAllStudentPdfs();

            // Set headers for ZIP download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/zip"));
            headers.setContentDispositionFormData("attachment",
                    "All_Report_Cards_" + LocalDate.now() + ".zip");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
   
            return new ResponseEntity<>(zipBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
