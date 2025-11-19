package com.nikhil.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;


@Entity
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Data
public class Subjects {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long subjectId;

    @Column(name = "subject_name", nullable = false)
    private String subjectName;

     @Column(nullable = false)
    private String marksType; 
    // values: "MARKS" or "GRADE"

    @ManyToOne()
    @JoinColumn(name = "subjects_class_id", nullable = false )
    private Classes classes;
}





