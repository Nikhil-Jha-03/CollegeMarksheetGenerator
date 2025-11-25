package com.nikhil.backend.dto;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class StudentDetailDTO {
    private String name;
    private Long grNo;
    private String annualResult;
    private String motherName;
    private String studentClass;
    private List<StudentSubjectDTO> subjects;
    private LocalDate dateOfIssue;
    private LocalDate dob;
    private long totalMarks;
    private String result;
    private long obtainedMarks;
    private double percentage;
    private String remark;
}
