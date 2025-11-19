package com.nikhil.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nikhil.backend.entity.Subjects;
import java.util.List;


public interface SubjectRepository extends JpaRepository<Subjects,Long> {
    public List<Subjects> findAllByClasses_ClassId(long id);
}
