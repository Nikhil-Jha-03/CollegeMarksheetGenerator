package com.nikhil.backend.services;

import com.nikhil.backend.dto.FinalStudentDetailDTO;

public interface PdfGenerationService {

    byte[] generateStudentReportDirect(FinalStudentDetailDTO student);

    byte[] generateAllStudentPdfs();

}
