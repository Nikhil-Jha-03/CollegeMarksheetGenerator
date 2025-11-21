package com.nikhil.backend.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;

import com.nikhil.backend.dto.FinalStudentDetailDTO;
import com.nikhil.backend.dto.StudentDetailDTO;
import com.nikhil.backend.payload.ApiResponse;
import com.nikhil.backend.repository.StudentRepository;

import jakarta.validation.constraints.Null;
import lombok.RequiredArgsConstructor;


public interface StudentService {

    ApiResponse<Void> savestudent(StudentDetailDTO entity);

    // ApiResponse<List<FinalStudentDetailDTO>> getallsavedstudent();
    ApiResponse<Page<FinalStudentDetailDTO>> getallsavedstudent(@NonNull Pageable pageable);

}
