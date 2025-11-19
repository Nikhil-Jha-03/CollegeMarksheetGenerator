package com.nikhil.backend.entity;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Entity
@Table(name = "StudentDetail", indexes = {
    @Index(name = "idx_gr_no",columnList = "grNo"),
    @Index(name = "idx_student_name", columnList = "studentName")
})
@AllArgsConstructor
@RequiredArgsConstructor
@Data
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long studentId;

    @Column(nullable = false)
    private long rollNo;

    @Column(nullable = false)
    private String studentName;

    @Column(nullable = false)
    private String grNo;

    @Column(nullable = false)
    private String motherName;

    @Column(nullable = false)
    private String studentClass;

    private LocalDate dateOfIssue;
    private LocalDate dob;



    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL,orphanRemoval = true)
    private List<StudentSubject> studentSubjects;

}
