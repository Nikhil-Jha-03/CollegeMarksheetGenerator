package com.nikhil.backend.dto;

import java.util.List;


public class StudentDetailDTO {
    private long studentId;
    private long rollNo;
    private String name;
    private String grNo;
    private String motherName;
    private String studentClass;
    private List<StudentSubjectDTO> studentSubjects;
}
