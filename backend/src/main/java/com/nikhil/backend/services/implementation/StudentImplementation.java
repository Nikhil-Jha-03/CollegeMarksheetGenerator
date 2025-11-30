package com.nikhil.backend.services.implementation;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.nikhil.backend.dto.FinalStudentDetailDTO;
import com.nikhil.backend.dto.PageResponse;
import com.nikhil.backend.dto.StudentDetailDTO;
import com.nikhil.backend.dto.StudentSubjectDTO;
import com.nikhil.backend.entity.Student;
import com.nikhil.backend.entity.StudentSubject;
import com.nikhil.backend.payload.ApiResponse;
import com.nikhil.backend.repository.StudentRepository;
import com.nikhil.backend.services.StudentService;
import com.nikhil.backend.specification.StudentSpecification;

import jakarta.transaction.Transactional;

import org.springframework.lang.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class StudentImplementation implements StudentService {

    @Autowired
    private StudentRepository studentRepository;

    private final ModelMapper modelMapper;

    @Override
    public ApiResponse<Void> savestudent(StudentDetailDTO entity) {

        Long grLong = entity.getGrNo();
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
        student2.setAnnualResult(entity.getAnnualResult());
        student2.setGrNo(grLong);
        student2.setMotherName(entity.getMotherName());
        student2.setName(entity.getName());
        student2.setObtainedMarks(entity.getObtainedMarks());
        student2.setPercentage(entity.getPercentage());
        student2.setResult(entity.getResult());
        student2.setRollNo(newRoll);
        student2.setStudentClass(entity.getStudentClass());
        student2.setTotalMarks(entity.getTotalMarks());
        student2.setRemark(entity.getRemark());

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
        studentSubject.setTotalMarks(dto.getTotal());
        studentSubject.setStudent(student);
        return studentSubject;
    }

    public long getNextRollNo() {
        Long lastRoll = studentRepository.findMaxRollNo();
        return (lastRoll == null) ? 1 : lastRoll + 1;
    }

    @Override
    public List<FinalStudentDetailDTO> getAllStudent() {
        List<Student> students = studentRepository.findAll();

        return students.stream()
                .map(s -> modelMapper.map(s, FinalStudentDetailDTO.class))
                .toList();
    }

    @Override
    public ApiResponse<PageResponse<FinalStudentDetailDTO>> getallsavedstudent(String searchBy, String search,
            @NonNull Pageable pageable) {

        try {

            if (searchBy != null && !searchBy.isEmpty()) {
                boolean fieldExists = Arrays.stream(Student.class.getDeclaredFields())
                        .anyMatch(f -> f.getName().equals(searchBy));

                if (!fieldExists) {
                    return new ApiResponse<>(false, "Invalid search field", null);
                }
            }

            Specification<Student> spec = StudentSpecification.getSpecification(searchBy, search);
            Page<Student> studentPage = studentRepository.findAll(spec, pageable);

            Page<FinalStudentDetailDTO> dtoPage = studentPage.map(
                    student -> modelMapper.map(student, FinalStudentDetailDTO.class));

            return new ApiResponse<>(true, "Student Details Saved", new PageResponse<>(
                    dtoPage.getContent(),
                    dtoPage.getNumber(),
                    dtoPage.getSize(),
                    dtoPage.getTotalElements(),
                    dtoPage.getTotalPages()));
        } catch (Exception e) {
            e.printStackTrace();
            return new ApiResponse<>(false, "Something went Wrong", null);
        }
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteStudent(Long id) {
        Student student = studentRepository.findByGrNo(id);

        if (student == null) {
            return new ApiResponse<>(false, "Student not found", null);
        }

        if (!studentRepository.existsById(student.getStudentId())) {
            return new ApiResponse<>(true, "Invalid Student", null);
        }

        studentRepository.deleteById(student.getStudentId());
        return new ApiResponse<>(true, "Deleted Student", null);
    }

    @Override
    public FinalStudentDetailDTO getStudentByGrNo(Long grNo) {
        Student student = studentRepository.findByGrNo(grNo);
        if (student == null) {
            return null;
        }
        FinalStudentDetailDTO finalStudentDetailDTO = modelMapper.map(student, FinalStudentDetailDTO.class);

        return finalStudentDetailDTO;
    }

    @Override
    public ApiResponse<Void> updateStudent(Long grno, StudentDetailDTO dto) {

        Student student = studentRepository.findByGrNo(grno);

        if (student == null) {
            return new ApiResponse<>(false, "Student not found", null);
        }

        // Save IDs that shouldn't be changed
        Long id = student.getStudentId();
        Long existingGr = student.getGrNo();
        Long roll = student.getRollNo();

        // Update basic fields
        student.setName(dto.getName());
        student.setMotherName(dto.getMotherName());
        student.setStudentClass(dto.getStudentClass());
        student.setAnnualResult(dto.getAnnualResult());
        student.setDob(dto.getDob());
        student.setDateOfIssue(dto.getDateOfIssue());
        student.setTotalMarks(dto.getTotalMarks());
        student.setObtainedMarks(dto.getObtainedMarks());
        student.setPercentage(dto.getPercentage());
        student.setResult(dto.getResult());
        student.setRemark(dto.getRemark());

        // Restore protected IDs
        student.setStudentId(id);
        student.setGrNo(existingGr);
        student.setRollNo(roll);

        // Clear existing subjects (orphanRemoval will delete them)
        student.getSubjects().clear();

        // Add new subjects
        if (dto.getSubjects() != null) {
            for (StudentSubjectDTO subDTO : dto.getSubjects()) {
                StudentSubject subject = new StudentSubject();
                subject.setSubjectName(subDTO.getSubjectName());
                subject.setTotalMarks(subDTO.getTotal());
                subject.setObtainedMarks(subDTO.getObtained());
                subject.setStudent(student);

                student.getSubjects().add(subject);
            }
        }

        studentRepository.save(student);

        return new ApiResponse<>(true, "Student updated successfully", null);
    }

    @Override
    public ApiResponse<FinalStudentDetailDTO> getAll() {
        List<Student> students = studentRepository.findAll();

        // Assuming you want to return the first student's details
        if (students.isEmpty()) {
            return new ApiResponse<>(false, "No students found", null);
        }

        FinalStudentDetailDTO dto = modelMapper.map(students.get(0), FinalStudentDetailDTO.class);
        return new ApiResponse<>(true, "Students fetched successfully", dto);
    }

}
