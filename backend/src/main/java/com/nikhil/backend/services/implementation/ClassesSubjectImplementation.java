package com.nikhil.backend.services.implementation;

import java.util.List;
import org.springframework.stereotype.Service;

import com.nikhil.backend.dto.ClassesDTO;
import com.nikhil.backend.dto.SubjectsDTO;
import com.nikhil.backend.entity.Classes;
import com.nikhil.backend.entity.Subjects;
import com.nikhil.backend.repository.ClassesRepository;
import com.nikhil.backend.repository.SubjectRepository;
import com.nikhil.backend.services.ClassesSubjectService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class ClassesSubjectImplementation implements ClassesSubjectService {

    private final ClassesRepository classesRepository;
    private final SubjectRepository subjectRepository;


    @Override
    public List<ClassesDTO> getclassesinfo() {
        List<Classes> classes = classesRepository.findAll();
        log.info("DATA FOUND ");
        List<ClassesDTO> classesDTOs = classes.stream()
                .map(item -> {
                    ClassesDTO dto = new ClassesDTO();
                    dto.setClassId(item.getClassId());
                    dto.setClassName(item.getClassName());
                    return dto;
                })
                .toList();

        return classesDTOs;
    }

    @Override
    public List<SubjectsDTO> getSubjectinfo(Long id) {
        List<Subjects> subjects = subjectRepository.findAllByClasses_ClassId(id);
        
        // List<SubjectsDTO> subjectsDTOs = subjects.stream().map(item -> modelMapper.map(item, SubjectsDTO.class)).toList();
        List<SubjectsDTO> subjectsDTOs = subjects.stream().map(item -> {
            SubjectsDTO sDto = new SubjectsDTO();
            sDto.setSubjectCode(item.getSubjectCode());
            sDto.setMarksType(item.getMarksType());
            sDto.setSubjectName(item.getSubjectName());
            sDto.setSubjectId(item.getSubjectId());
            return sDto;
        }).toList();
        System.out.println(subjectsDTOs);
        log.info("Hey",subjectsDTOs);
        return subjectsDTOs;
    }

}
