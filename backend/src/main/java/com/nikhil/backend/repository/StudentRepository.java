package com.nikhil.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import com.nikhil.backend.entity.Student;


public interface StudentRepository extends JpaRepository<Student,Long>, JpaSpecificationExecutor<Student> {
    @Query("SELECT MAX(s.rollNo) FROM Student s")
    Long findMaxRollNo();
    Student findByGrNo(Long grNo);
}
