package com.nikhil.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class FinalStudentSubjectDTO {
    private String subjectName;
    private String total; 
    private String obtained;
}
