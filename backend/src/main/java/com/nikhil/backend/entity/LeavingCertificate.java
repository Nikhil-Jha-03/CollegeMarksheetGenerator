package com.nikhil.backend.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "leaving_certificate", indexes = {
        @Index(name = "idx_student_name", columnList = "studentName"),
        @Index(name = "idx_lc_gr_no", columnList = "grNo")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeavingCertificate {

     @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --------------------
    // Student Type
    // --------------------
    @Column(nullable = false)
    private String studentType; // FOR REGULAR STUDENT / FOR PRIVATE STUDENT

    // --------------------
    // Identification
    // --------------------
    private String grNo;

    private Boolean isDuplicate;

    private String studentPEN;

    @Column(name = "unique_id_adhar")
    private String uniqueIDAdhar;

    private String studentApaarID;

    private String studentID;

    // --------------------
    // Personal Details
    // --------------------
    @Column(nullable = false)
    private String studentName;

    @Column(nullable = false)
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

    private LocalDate dateOfBirth;

    @Column(length = 150)
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
    @Column(length = 200)
    private String reasonForLeaving;

    @Column(length = 500)
    private String remarks;
}
