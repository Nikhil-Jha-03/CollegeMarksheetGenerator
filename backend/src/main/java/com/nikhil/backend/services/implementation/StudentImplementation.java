package com.nikhil.backend.services.implementation;

import java.util.List;
import java.util.stream.Collector;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nikhil.backend.dto.StudentDetailDTO;
import com.nikhil.backend.dto.StudentSubjectDTO;
import com.nikhil.backend.entity.Student;
import com.nikhil.backend.entity.StudentSubject;
import com.nikhil.backend.payload.ApiResponse;
import com.nikhil.backend.repository.StudentRepository;
import com.nikhil.backend.services.StudentService;

import jakarta.validation.constraints.Null;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class StudentImplementation implements StudentService {

    @Autowired
    private StudentRepository studentRepository;
    
    @Override
    public ApiResponse<Void> savestudent(StudentDetailDTO entity) {


        Long grLong = Long.parseLong(entity.getGrNo());
        Long newRoll = getNextRollNo();

        Student existingStudent = studentRepository.findByGrNo(grLong);

        // Correct duplicate check
        if (existingStudent != null) {
            return new ApiResponse<>(false, 
                "Student with the same GR number already exists", 
                null);
        }

        Student student2 = new Student();
        student2.setDateOfIssue(entity.getDateOfIssue());
        student2.setDob(entity.getDob());
        student2.setGrNo(grLong);
        student2.setMotherName(entity.getMotherName());
        student2.setName(entity.getName());
        student2.setObtainedMarks(entity.getObtainedMarks());
        student2.setPercentage(entity.getPercentage());
        student2.setResult(entity.getResult()); // FIXED
        student2.setRollNo(newRoll);
        student2.setStudentClass(entity.getStudentClass());
        student2.setTotalMarks(entity.getTotalMarks());

        // Convert DTO → Entity
        List<StudentSubjectDTO> subjectDTOs = entity.getSubjects();

        List<StudentSubject> subjectEntities = subjectDTOs.stream()
                .map(dto -> convertToEntity(dto, student2))
                .collect(Collectors.toList());

        student2.setSubjects(subjectEntities);

        // SAVE STUDENT
        studentRepository.save(student2);
    
        return new ApiResponse<>(true, "Student Details Saved", null);
    }

    private StudentSubject convertToEntity(StudentSubjectDTO dto, Student student) {
        StudentSubject studentSubject = new StudentSubject();
        studentSubject.setObtainedMarks(dto.getObtained());
        studentSubject.setSubjectName(dto.getSubjectName());
        ;
        studentSubject.setTotalMarks(dto.getTotal());
        studentSubject.setStudent(student);
        return studentSubject;
    }

    public long getNextRollNo() {
        Long lastRoll = studentRepository.findMaxRollNo();
        return (lastRoll == null) ? 1 : lastRoll + 1;
    }
}
