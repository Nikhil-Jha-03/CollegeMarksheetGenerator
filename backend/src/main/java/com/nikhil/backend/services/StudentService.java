package com.nikhil.backend.services;

import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;

import com.nikhil.backend.dto.FinalStudentDetailDTO;
import com.nikhil.backend.dto.PageResponse;
import com.nikhil.backend.dto.StudentDetailDTO;
import com.nikhil.backend.payload.ApiResponse;



public interface StudentService {

    ApiResponse<Void> savestudent(StudentDetailDTO entity);

    // ApiResponse<List<FinalStudentDetailDTO>> getallsavedstudent();
    ApiResponse<PageResponse<FinalStudentDetailDTO>> getallsavedstudent(@NonNull Pageable pageable);

    ApiResponse<Void> deleteStudent(Long id);

}
