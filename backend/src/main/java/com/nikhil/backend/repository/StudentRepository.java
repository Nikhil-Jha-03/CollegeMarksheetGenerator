package com.nikhil.backend.repository;

import org.hibernate.query.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.web.PagedModel;

import com.nikhil.backend.entity.Student;


public interface StudentRepository extends JpaRepository<Student,Long> {
    @Query("SELECT MAX(s.rollNo) FROM Student s")
    Long findMaxRollNo();
    Student findByGrNo(Long grNo);
}
