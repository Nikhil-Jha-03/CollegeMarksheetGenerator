package com.nikhil.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nikhil.backend.dto.StudentDetailDTO;
import com.nikhil.backend.payload.ApiResponse;
import com.nikhil.backend.services.StudentService;

import jakarta.validation.constraints.Null;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/student")
@Slf4j
@CrossOrigin
public class StudentController {

    @Autowired
    private StudentService studentService;

    @PostMapping("/savestudent")
    public ResponseEntity<ApiResponse<Void>> postMethodName(@RequestBody StudentDetailDTO entity) {
        return ResponseEntity.ok().body(studentService.savestudent(entity));
    }
    

}
