package com.nikhil.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nikhil.backend.entity.Student;

public interface StudentRepository extends JpaRepository<Student,Long> {}
