package com.nikhil.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nikhil.backend.dto.ClassesDTO;
import com.nikhil.backend.dto.SubjectsDTO;
import com.nikhil.backend.services.ClassesSubjectService;

import lombok.extern.slf4j.Slf4j;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


@RestController
@RequestMapping("/defaultData")
@Slf4j
@CrossOrigin
public class Class_subject_controller {

    @Autowired
    private ClassesSubjectService classesSubjectService;

    @GetMapping("/getclassesinfo")
    public ResponseEntity<List<ClassesDTO>> getclassesinformation() {
        return ResponseEntity.ok().body(classesSubjectService.getclassesinfo());
    }

    @GetMapping("/getsubjectinfo/{id}")
    public ResponseEntity<List<SubjectsDTO>> getclassesSubjectinformation(@PathVariable long id ) {
        return ResponseEntity.ok().body(classesSubjectService.getSubjectinfo(id));
    }
}
