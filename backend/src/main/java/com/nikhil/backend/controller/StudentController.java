package com.nikhil.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nikhil.backend.dto.FinalStudentDetailDTO;
import com.nikhil.backend.dto.PageResponse;
import com.nikhil.backend.dto.StudentDetailDTO;
import com.nikhil.backend.payload.ApiResponse;
import com.nikhil.backend.services.StudentService;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;


@RestController
@RequestMapping("/student")
@Slf4j
public class StudentController {
    @Autowired
    private StudentService studentService;

    @PostMapping("/savestudent")
    public ResponseEntity<ApiResponse<Void>> postMethodName(@RequestBody StudentDetailDTO entity) {
        return ResponseEntity.ok().body(studentService.savestudent(entity));
    }

    @GetMapping("/getsavedstudent")
    public ResponseEntity<ApiResponse<PageResponse<FinalStudentDetailDTO>>> getStudentDetailWithPageable(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "5") int size,
            @RequestParam(required = false,defaultValue = "") String searchBy,
            @RequestParam(required = false,defaultValue = "") String search) {
        return ResponseEntity.ok(
                studentService.getallsavedstudent(searchBy,search, PageRequest.of(page, size)));
    }

    @GetMapping("/getAllStudent")
    public ResponseEntity<ApiResponse<List<FinalStudentDetailDTO>>> getAllStudent() {

        return ResponseEntity.ok(
                studentService.getAll());
    }

    @DeleteMapping("/deleteAllStudents")
    public ResponseEntity<ApiResponse<Void>> deleteAllStudents() {
        return ResponseEntity.ok(studentService.deleteAll());
    }
    
    @GetMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable Long id) {
        return ResponseEntity.ok().body(studentService.deleteStudent(id));
    }

    @GetMapping("/getStudent/{allstudent}")
    public ResponseEntity<FinalStudentDetailDTO> getMethodName(@PathVariable Long allstudent) {
        return ResponseEntity.ok().body(studentService.getStudentByGrNo(allstudent));
    }

    @PutMapping("/updatestudent/{grno}")
    public ResponseEntity<ApiResponse<Void>> updateStudent(@PathVariable Long grno, @RequestBody StudentDetailDTO entity) {
        return ResponseEntity.ok().body(studentService.updateStudent(grno,entity));
    }
    
}
