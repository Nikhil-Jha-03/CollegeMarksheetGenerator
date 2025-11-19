package com.nikhil.backend.services;

import java.util.List;

import com.nikhil.backend.dto.ClassesDTO;
import com.nikhil.backend.dto.SubjectsDTO;

public interface ClassesSubjectService {

    List<ClassesDTO> getclassesinfo();

    List<SubjectsDTO> getSubjectinfo(Long id);

}
