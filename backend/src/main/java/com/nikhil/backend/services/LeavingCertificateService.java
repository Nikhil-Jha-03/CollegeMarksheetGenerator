package com.nikhil.backend.services;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;

import com.nikhil.backend.dto.LCResponseDTO;
import com.nikhil.backend.dto.LeavingCertificateDTO;
import com.nikhil.backend.dto.PageResponse;
import com.nikhil.backend.payload.ApiResponse;

public interface LeavingCertificateService {

    ApiResponse<Void> createLC(LeavingCertificateDTO entity);

    ApiResponse<List<LCResponseDTO>> getAllLC();

    ApiResponse<Void> deleteLC(Long id);

    byte[] downloadLC(Long id);

    ApiResponse<PageResponse<LCResponseDTO>> searchLC(String search, @NonNull Pageable pageable);

    ApiResponse<Void> updateLC(Long id, LeavingCertificateDTO entity);

    ApiResponse<LeavingCertificateDTO> getLCById(Long id);

}
