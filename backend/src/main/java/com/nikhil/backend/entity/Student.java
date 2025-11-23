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
import lombok.ToString;

@Entity
@Table(name = "StudentDetail", indexes = {
    @Index(name = "idx_gr_no",columnList = "grNo"),
    @Index(name = "idx_name", columnList = "name")
})
@AllArgsConstructor
@RequiredArgsConstructor
@Data
@ToString
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long studentId;

    private String annualResult;

    private long rollNo;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private long grNo;

    @Column(nullable = false)
    private String motherName;

    @Column(nullable = false)
    private String studentClass;

    private LocalDate dateOfIssue;
    private LocalDate dob;

    private long totalMarks;
    private long obtainedMarks;

    private double percentage;
    private String result;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL,orphanRemoval = true)
    private List<StudentSubject> subjects;

}
