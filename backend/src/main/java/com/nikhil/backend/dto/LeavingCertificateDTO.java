package com.nikhil.backend.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;



@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class LeavingCertificateDTO {
 

    private Long id;

    // --------------------
    // Student Type
    // --------------------
    @NotBlank(message = "Student type is required")
    private String studentType;

    // --------------------
    // Identification
    // --------------------
    private String grNo;

    private String studentPEN;

    private String uniqueIDAdhar;

    private String studentApaarID;

    private String studentID;

    private Boolean isDuplicate;

    // --------------------
    // Personal Details
    // --------------------
    
    @NotBlank(message = "Student name is required")
    private String studentName;

    @NotBlank(message = "Mother name is required")
    private String motherName;

    private String nationality;

    private String motherTongue;

    private String religion;

    private String caste;

    // --------------------
    // Academic / Behaviour
    // --------------------
    private String progress;

    private String conduct;

    // --------------------
    // Birth & Location
    // --------------------
    private String placeOfBirth;

    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;

    private String dateOfBirthWords;

    // --------------------
    // School Details
    // --------------------
    private String lastSchool;

    private LocalDate dateOfAdmission;

    private LocalDate dateOfLeaving;

    private String standard;

    // --------------------
    // Certificate Details
    // --------------------
    private String reasonForLeaving;

    private String remarks;
}
