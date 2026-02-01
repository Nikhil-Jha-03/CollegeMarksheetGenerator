package com.nikhil.backend.services;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;

import com.nikhil.backend.dto.FinalStudentDetailDTO;
import com.nikhil.backend.dto.PageResponse;
import com.nikhil.backend.dto.StudentDetailDTO;
import com.nikhil.backend.payload.ApiResponse;



public interface StudentService {

    ApiResponse<Void> savestudent(StudentDetailDTO entity);

    ApiResponse<PageResponse<FinalStudentDetailDTO>> getallsavedstudent(String searchBy,String search,@NonNull Pageable pageable);

    ApiResponse<Void> deleteStudent(Long id);
    List<FinalStudentDetailDTO> getAllStudent();

    FinalStudentDetailDTO getStudentByGrNo(Long grNo);

    ApiResponse<Void> updateStudent(Long grno, StudentDetailDTO entity);

    ApiResponse<List<FinalStudentDetailDTO>> getAll();

    ApiResponse<Void> deleteAll();

    byte[] generateHallTicket(Long grno);

    byte[] batchHallTicketDownload();

}
