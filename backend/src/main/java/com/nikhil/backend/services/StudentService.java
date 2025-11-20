package com.nikhil.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nikhil.backend.dto.StudentDetailDTO;
import com.nikhil.backend.payload.ApiResponse;
import com.nikhil.backend.repository.StudentRepository;

import jakarta.validation.constraints.Null;
import lombok.RequiredArgsConstructor;


public interface StudentService {

    ApiResponse<Void> savestudent(StudentDetailDTO entity);

}
