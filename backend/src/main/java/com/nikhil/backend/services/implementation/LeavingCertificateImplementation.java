package com.nikhil.backend.services.implementation;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import com.itextpdf.html2pdf.ConverterProperties;
import com.itextpdf.html2pdf.HtmlConverter;
import com.nikhil.backend.dto.LCResponseDTO;
import com.nikhil.backend.dto.LeavingCertificateDTO;
import com.nikhil.backend.dto.PageResponse;
import com.nikhil.backend.entity.LeavingCertificate;
import com.nikhil.backend.payload.ApiResponse;
import com.nikhil.backend.repository.LeavingCertificateRepository;
import com.nikhil.backend.services.LeavingCertificateService;
import com.nikhil.backend.specification.LeavingCertificateSpecification;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LeavingCertificateImplementation implements LeavingCertificateService {

    @Autowired
    private LeavingCertificateRepository leavingCertificateRepository;

    private final ModelMapper modelMapper;

    @Override
    public ApiResponse<Void> createLC(LeavingCertificateDTO entity) {
        // Validate DTO
        ApiResponse<Void> validationResponse = validateLeavingCertificateDTO(entity);
        if (!validationResponse.isSuccess()) {
            return validationResponse;
        }

        try {
            boolean isPrivateStudent = "FOR PRIVATE STUDENT".equalsIgnoreCase(entity.getStudentType());
            LeavingCertificate lc = new LeavingCertificate();

            // -------- COMMON FIELDS (same for both) --------
            lc.setStudentType(entity.getStudentType().trim());
            lc.setUniqueIDAdhar(entity.getUniqueIDAdhar().trim());
            lc.setStudentName(entity.getStudentName().trim().toUpperCase());
            lc.setMotherName(entity.getMotherName().trim().toUpperCase());
            lc.setNationality(entity.getNationality().trim().toUpperCase());
            lc.setMotherTongue(entity.getMotherTongue().trim().toUpperCase());
            lc.setReligion(entity.getReligion().trim().toUpperCase());
            lc.setCaste(entity.getCaste().trim().toUpperCase());
            lc.setProgress(entity.getProgress().trim().toUpperCase());
            lc.setConduct(entity.getConduct().trim().toUpperCase());
            lc.setPlaceOfBirth(entity.getPlaceOfBirth().trim().toLowerCase());
            lc.setDateOfBirth(entity.getDateOfBirth());
            lc.setDateOfBirthWords(entity.getDateOfBirthWords().trim().toUpperCase());
            lc.setLastSchool(entity.getLastSchool().trim().toUpperCase());
            lc.setDateOfAdmission(entity.getDateOfAdmission());
            lc.setDateOfLeaving(entity.getDateOfLeaving());
            lc.setStandard(entity.getStandard().trim().toUpperCase());
            lc.setReasonForLeaving(entity.getReasonForLeaving().trim().toUpperCase());
            lc.setRemarks(entity.getRemarks().trim().toUpperCase());
            lc.setIsDuplicate(entity.getIsDuplicate());

            // -------- CONDITIONAL FIELDS --------
            if (isPrivateStudent) {
                // PRIVATE STUDENT → remove ONLY these
                lc.setGrNo(null);
                lc.setStudentPEN(null);
                lc.setStudentApaarID(null);
                lc.setStudentID(null);
            } else {
                // REGULAR STUDENT
                if (entity.getGrNo() == null || entity.getGrNo().isBlank()) {
                    return new ApiResponse<>(false, "GR No is required for regular student", null);
                }
                lc.setGrNo(entity.getGrNo().trim());
                lc.setStudentPEN(entity.getStudentPEN() != null ? entity.getStudentPEN().trim() : null);
                lc.setStudentApaarID(entity.getStudentApaarID() != null ? entity.getStudentApaarID().trim() : null);
                lc.setStudentID(entity.getStudentID() != null ? entity.getStudentID().trim() : null);
            }

            leavingCertificateRepository.save(lc);
            return new ApiResponse<>(true, "LC created successfully", null);

        } catch (Exception e) {
            return new ApiResponse<>(false, "Error creating LC: " + e.getMessage(), null);
        }
    }

    /**
     * Validates the LeavingCertificateDTO for required fields and data integrity
     * 
     * @param dto the LeavingCertificateDTO to validate
     * @return ApiResponse with validation status
     */
    private ApiResponse<Void> validateLeavingCertificateDTO(LeavingCertificateDTO dto) {
        // Null check
        if (dto == null) {
            return new ApiResponse<>(false, "LeavingCertificateDTO cannot be null", null);
        }

        // Validate common required fields
        if (isNullOrBlank(dto.getStudentType())) {
            return new ApiResponse<>(false, "Student Type is required", null);
        }

        if (isNullOrBlank(dto.getUniqueIDAdhar())) {
            return new ApiResponse<>(false, "Unique ID (Aadhar) is required", null);
        }

        if (isNullOrBlank(dto.getStudentName())) {
            return new ApiResponse<>(false, "Student Name is required", null);
        }

        if (isNullOrBlank(dto.getMotherName())) {
            return new ApiResponse<>(false, "Mother Name is required", null);
        }

        if (isNullOrBlank(dto.getNationality())) {
            return new ApiResponse<>(false, "Nationality is required", null);
        }

        if (isNullOrBlank(dto.getMotherTongue())) {
            return new ApiResponse<>(false, "Mother Tongue is required", null);
        }

        if (isNullOrBlank(dto.getReligion())) {
            return new ApiResponse<>(false, "Religion is required", null);
        }

        if (isNullOrBlank(dto.getCaste())) {
            return new ApiResponse<>(false, "Caste is required", null);
        }

        if (isNullOrBlank(dto.getProgress())) {
            return new ApiResponse<>(false, "Progress is required", null);
        }

        if (isNullOrBlank(dto.getConduct())) {
            return new ApiResponse<>(false, "Conduct is required", null);
        }

        if (isNullOrBlank(dto.getPlaceOfBirth())) {
            return new ApiResponse<>(false, "Place of Birth is required", null);
        }

        if (dto.getDateOfBirth() == null) {
            return new ApiResponse<>(false, "Date of Birth is required", null);
        }

        if (isNullOrBlank(dto.getDateOfBirthWords())) {
            return new ApiResponse<>(false, "Date of Birth (in words) is required", null);
        }

        if (isNullOrBlank(dto.getLastSchool())) {
            return new ApiResponse<>(false, "Last School is required", null);
        }

        if (dto.getDateOfAdmission() == null) {
            return new ApiResponse<>(false, "Date of Admission is required", null);
        }

        if (dto.getDateOfLeaving() == null) {
            return new ApiResponse<>(false, "Date of Leaving is required", null);
        }

        if (isNullOrBlank(dto.getStandard())) {
            return new ApiResponse<>(false, "Standard is required", null);
        }

        if (isNullOrBlank(dto.getReasonForLeaving())) {
            return new ApiResponse<>(false, "Reason for Leaving is required", null);
        }

        if (isNullOrBlank(dto.getRemarks())) {
            return new ApiResponse<>(false, "Remarks is required", null);
        }

        // Validate student type
        if (!isValidStudentType(dto.getStudentType())) {
            return new ApiResponse<>(false,
                    "Invalid Student Type. Allowed values: 'FOR PRIVATE STUDENT' or 'REGULAR STUDENT'", null);
        }

        // Validate date logic
        if (dto.getDateOfLeaving().isBefore(dto.getDateOfAdmission())) {
            return new ApiResponse<>(false, "Date of Leaving cannot be before Date of Admission", null);
        }

        if (dto.getDateOfBirth().isAfter(dto.getDateOfAdmission())) {
            return new ApiResponse<>(false, "Date of Birth cannot be after Date of Admission", null);
        }

        // Validate Aadhar format (12 digits)
        if (!isValidAadhar(dto.getUniqueIDAdhar())) {
            return new ApiResponse<>(false, "Invalid Aadhar format. It should be 12 digits", null);
        }

        return new ApiResponse<>(true, "Validation successful", null);
    }

    /**
     * Helper method to check if string is null or blank
     */
    private boolean isNullOrBlank(String value) {
        return value == null || value.isBlank();
    }

    /**
     * Helper method to validate student type
     */
    private boolean isValidStudentType(String studentType) {
        return "FOR PRIVATE STUDENT".equalsIgnoreCase(studentType) ||
                "FOR REGULAR STUDENT".equalsIgnoreCase(studentType);
    }

    /**
     * Helper method to validate Aadhar format (12 digits)
     */
    private boolean isValidAadhar(String aadhar) {
        if (isNullOrBlank(aadhar)) {
            return false;
        }
        return aadhar.trim().matches("^\\d{12}$");
    }

    @Override
    public ApiResponse<List<LCResponseDTO>> getAllLC() {
        try {
            Pageable pageable = PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "id"));
            List<LeavingCertificate> entities = leavingCertificateRepository
                    .findAll(pageable)
                    .getContent();

            if (entities.isEmpty()) {
                return new ApiResponse<>(false, "No LC records found", null);
            }

            List<LCResponseDTO> responseDTOs = entities.stream()
                    .map(entity -> LCResponseDTO.builder()
                            .id(entity.getId())
                            .studentType(entity.getStudentType())
                            .grNo(entity.getGrNo())
                            .studentPEN(entity.getStudentPEN())
                            .uniqueIDAdhar(entity.getUniqueIDAdhar())
                            .studentApaarID(entity.getStudentApaarID())
                            .studentID(entity.getStudentID())
                            .studentName(entity.getStudentName())
                            .standard(entity.getStandard())
                            .build())
                    .toList();

            return new ApiResponse<>(true, "Fetched LC records successfully", responseDTOs);

        } catch (Exception e) {
            return new ApiResponse<>(false, "Error retrieving LC records: " + e.getMessage(), null);
        }
    }

    @Override
    public ApiResponse<Void> deleteLC(Long id) {
        try {
            leavingCertificateRepository.deleteById(id);
            return new ApiResponse<>(true, "LC deleted successfully", null);
        } catch (Exception e) {
            return new ApiResponse<>(false, "Error deleting LC: " + e.getMessage(), null);
        }
    }

    @Override
    public byte[] downloadLC(Long id) {

        try {
            LeavingCertificate lc = leavingCertificateRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("LC not found for id: " + id));

            LeavingCertificateDTO lcDTO = modelMapper.map(lc, LeavingCertificateDTO.class);
            System.out.println("Mapped LeavingCertificate to LeavingCertificateDTO: " + lcDTO.toString());

            String htmlContent = buildLeavingCertificateHtml(lcDTO);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            // Set converter properties for better rendering
            ConverterProperties converterProperties = new ConverterProperties();
            converterProperties.setBaseUri("classpath:/static/");

            HtmlConverter.convertToPdf(htmlContent, outputStream, converterProperties);
            return outputStream.toByteArray();

        } catch (Exception e) {

            e.printStackTrace();
            throw new RuntimeException("Failed to generate LC PDF", e);

        }
    }

    private String buildLeavingCertificateHtml(LeavingCertificateDTO lcDTO) {

        StringBuilder html = new StringBuilder();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        String logoBase64 = getLogoAsBase64();

        if (logoBase64 != null && logoBase64.startsWith("data:image")) {
            logoBase64 = logoBase64.substring(logoBase64.indexOf(",") + 1);
        }

        html.append("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                    %s
                    </style>
                </head>
                <body>
                    <div class="page">
                        <div class="container">

                            <div class="header-box">

                                <div class="logo-container">
                """.formatted(getLCCssStyles()));

        if (logoBase64 != null && !logoBase64.isEmpty()) {
            html.append("""
                                        <img src="data:image/png;base64,%s" class="logo">
                    """.formatted(logoBase64));
        }

        html.append(
                """
                                                </div>

                                                <div class="college-info">
                                                    <div class="trust-name">Pragnya Educational Trust's</div>
                                                    <div class="college-name">Pragnya Junior College of Arts, Commerce & Science</div>
                                                    <div class="board-info">(Approved by Maharashtra State Board)</div>
                                                    <div class="address-line">
                                                        Address: Sr. No.-25/1/1, Village Handewadi/Autade, off Katraj – Saswad by pass Road<br>
                                                        Tal.- Haveli, Po.- Urli-Devachi, Pin. No. - 412308
                                                    </div>
                                                    <div class="contact-line">
                                                        Phone No. - +91 – 9970888604<br>
                                                        Website: www.pragnyacollege.com | Email: Pragnyajc@gmail.com
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="index-strip">
                                                <table class="plain-table">
                                                    <tr>
                                                        <td style="text-align:left;">INDEX NO.:- J11.15.092</td>
                                                        <td style="text-align:right;">U-DISE NO:- 27250500703</td>
                                                    </tr>
                                                </table>
                                            </div>
                        """);

        // --- Prepare Logic for SR/GR/Subtitle ---
        String srNoValue = lcDTO.getId() != null ? lcDTO.getId().toString() : "_______";

        String grNoContent = "";
        if (lcDTO.getGrNo() != null && !lcDTO.getGrNo().trim().isEmpty()) {
            grNoContent = "General Register No. <b>" + lcDTO.getGrNo() + "</b>";
        }

        String subTitleText;
        if (Boolean.TRUE.equals(lcDTO.getIsDuplicate())) {
            subTitleText = "<span style='color: red;'>DUPLICATE LEAVING CERTIFICATE</span>";
        } else {
            subTitleText = lcDTO.getStudentType() != null ? lcDTO.getStudentType() : "FOR REGULAR STUDENT";
        }
        // ----------------------------------------

        html.append("""
                            <div class="ref-strip">
                                <table class="plain-table">
                                    <tr>
                                        <td style="text-align:left;">LC. NO. <b>%s</b></td>
                                        <td style="text-align:right;">%s</td>
                                    </tr>
                                </table>
                            </div>

                            <div class="main-title">LEAVING CERTIFICATE</div>

                            <div class="sub-title-box">%s</div>

                            <table class="info-table">
                """.formatted(srNoValue, grNoContent, subTitleText));

        // --- Rows Logic ---
        if ("FOR REGULAR STUDENT".equalsIgnoreCase(lcDTO.getStudentType())) {
            addFullRow(html, null, "Student PEN", safe(lcDTO.getStudentPEN()));
            addFullRow(html, null, "Student Apaar ID", safe(lcDTO.getStudentApaarID()));
            addFullRow(html, null, "Student ID", safe(lcDTO.getStudentID()));
        }

        addFullRow(html, null, "Unique ID (Aadhar Card No.)", safe(lcDTO.getUniqueIDAdhar()));

        int n = 1;

        addFullRow(html, n++,
                "Name of the Student in Full<br><span style='font-size:7pt; font-weight:normal;'>(Name-Father's name-Surname)</span>",
                safe(lcDTO.getStudentName()));
        addFullRow(html, n++, "Mother's Name", safe(lcDTO.getMotherName()));
        addFullRow(html, n++, "Nationality", safe(lcDTO.getNationality()));
        addFullRow(html, n++, "Mother Tongue", safe(lcDTO.getMotherTongue()));
        addFullRow(html, n++, "Religion", safe(lcDTO.getReligion()));
        addFullRow(html, n++, "Caste & Sub-Caste", safe(lcDTO.getCaste()));
        addFullRow(html, n++,
                "Place of Birth<br><span style='font-size:7pt; font-weight:normal;'>(Village/City, Taluka Zilla, State, Country)</span>",
                safe(lcDTO.getPlaceOfBirth()));
        addFullRow(html, n++, "Date of Birth (according to Christian era.)",
                formatDate(lcDTO.getDateOfBirth(), formatter));
        addFullRow(html, n++, "Date of Birth (in words)", safe(lcDTO.getDateOfBirthWords()));
        addFullRow(html, n++, "Last School/ College attended & Std.", safe(lcDTO.getLastSchool()));

        String admissionVal = formatDate(lcDTO.getDateOfAdmission(), formatter) + " IN " + safe(lcDTO.getStandard());
        addFullRow(html, n++, "Date of Admission", admissionVal);
        addFullRow(html, n++, "Progress", safe(lcDTO.getProgress()));
        addFullRow(html, n++, "Conduct", safe(lcDTO.getConduct()));
        addFullRow(html, n++, "Date of leaving the college", formatDate(lcDTO.getDateOfLeaving(), formatter));
        addFullRow(html, n++, "Standard in which studying", safe(lcDTO.getStandard()));
        addFullRow(html, n++, "Reason for leaving the College", safe(lcDTO.getReasonForLeaving()));
        addFullRow(html, n++, "Remarks", safe(lcDTO.getRemarks()));

        html.append(
                """
                                    </table>

                                    <div class="note">
                                        <b>Note:</b> No Change in any entry to be made except by the authority issuing the leaving certificate
                                        and that infringement of the requirement is liable to incur the imposition of penalty. Certified
                                        that the above information is the accordance with the <b>School General Register</b>
                                    </div>

                                    <div class="footer-wrapper">


                                        <table class="sig-table">
                                            <tr>
                                                <td style="text-align:left; padding-left:10px;">Class Teacher:</td>
                                                <td style="text-align:center;">Clerk</td>
                                                <td style="text-align:right; padding-right:10px;">Principal</td>
                                            </tr>
                                        </table>

                                    </div> </div> </div>
                        </body>
                        </html>
                        """);

        return html.toString();
    }

    // Helper for Full Width Rows (Label | Value spans 3 cols)
    private void addFullRow(StringBuilder html, Integer number, String label, String value) {
        // If number is present, format it like "1) ", else empty
        String numPrefix = (number != null && number > 0) ? number + ") " : "";

        html.append(String.format("""
                <tr>
                    <td class="label-cell">%s%s</td>
                    <td class="value-cell" colspan="3">%s</td>
                </tr>
                """, numPrefix, label, value));
    }

    private String getLCCssStyles() {
        return """
                @page {
                    size: A4;
                    margin: 10mm;
                }
                body {
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 9pt;
                    margin: 0;
                    line-height: 1.3;
                    color: #000;
                }
                .container { padding: 5px; }

                /* --- NEW HEADER STYLES (No Table) --- */
                .header-box {
                    position: relative; /* Anchor for the absolute logo */
                    padding: 10px 5px;
                    margin-bottom: 5px;
                    min-height: 100px; /* Ensures height even if text is short */
                }

                .logo-container {
                    position: absolute;
                    left: 10px;  /* Distance from left border */
                    top: 5px;    /* Distance from top border - Move this to adjust "up/down" */
                    width: 90px;
                    text-align: center;
                    z-index: 10;
                }

                .logo {
                    width: 80px;
                    height: auto;
                }

                .college-info {
                    text-align: center;
                    width: 100%;
                    /* Padding ensures text doesn't touch the edges, but remains centered to the Page */
                    padding: 0 10px;
                }
                /* ------------------------------------ */

                .trust-name { font-size: 8pt; font-weight: 600; margin-bottom: 2px; }
                .college-name { font-size: 13pt; font-weight: bold; margin-bottom: 2px; text-transform: uppercase; color: #222; }
                .board-info { font-size: 8pt; font-weight: normal; margin-bottom: 2px; }
                .address-line, .contact-line { font-size: 7.5pt; font-weight: normal; line-height: 1.2; }

                .index-strip {
                    border-top: 3px double #000;
                    border-bottom: 3px double #000;
                    padding: 3px 0;
                    margin-bottom: 10px;
                }
                .plain-table { width: 100%; border-collapse: collapse; }
                .plain-table td { font-weight: bold; font-size: 9pt; border: none; }
                .ref-strip { margin-bottom: 5px; }

                .main-title {
                    text-align: center;
                    font-size: 14pt;
                    font-weight: normal;
                    text-decoration: underline;
                    margin-top: 5px;
                    text-transform: uppercase;
                }
                .sub-title-box {
                    width: 210px;
                    margin: 2px auto 10px auto;
                    color: #000;
                    text-align: center;
                    font-size: 8pt;
                    font-weight: bold;
                    padding: 1px;
                    text-transform: uppercase;
                }

                .info-table { width: 100%; border-collapse: collapse; border: 1px solid #000; }
                .info-table td { border: 1px solid #000; padding: 4px 6px; font-size: 8.5pt; vertical-align: middle; }
                .label-cell { width: 30%; font-weight: normal; }
                .value-cell { font-weight: 600; text-transform: uppercase; }

                .footer-wrapper {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                }

                .note {
                    font-size: 8pt;
                    text-align: justify;
                    line-height: 1.4;
                    padding-bottom: 5px;
                    padding-top: 5px;
                    margin-bottom: 30px; /* Space between note and signatures */
                }

                .sig-table {
                    width: 100%;
                    table-layout: fixed; /* Ensures equal width for centering Clerk */
                }
                .sig-table td { font-weight: bold; font-size: 10pt; vertical-align: bottom; }
                .sig-table td:first-child { text-align: left; }
                .sig-table td:nth-child(2) { text-align: center; }
                .sig-table td:last-child { text-align: right; }
                """;
    }

    /**
     * Converts HTML to PDF using Flying Saucer (iText Renderer)
     */
    private byte[] convertHtmlToPdf(String htmlContent) throws Exception {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            // Set converter properties for better rendering
            ConverterProperties converterProperties = new ConverterProperties();
            converterProperties.setBaseUri("classpath:/static/");

            HtmlConverter.convertToPdf(htmlContent, outputStream, converterProperties);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF: " + e.getMessage(), e);
        }
    }

    /**
     * Format LocalDate to dd-MM-yyyy format
     */
    private String formatDate(LocalDate dateStr, DateTimeFormatter formatter) {
        if (dateStr == null)
            return "";
        try {
            return dateStr.format(formatter);
        } catch (Exception e) {
            return dateStr.format(formatter);
        }
    }

    /**
     * Safe trim - handles null values
     */

    private String safe(Object val) {
        return val == null ? "" : val.toString();
    }

    /**
     * Get logo as base64 - placeholder implementation
     * Replace with actual implementation to read logo file
     */

    private String getLogoAsBase64() {
        try {
            ClassPathResource resource = new ClassPathResource("static/images/CollegeLogo.png");
            InputStream inputStream = resource.getInputStream();
            byte[] imageBytes = inputStream.readAllBytes();
            inputStream.close();

            // Convert to Base64
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            return "data:image/png;base64," + base64Image;
        } catch (IOException e) {
            System.err.println("Warning: Could not load logo image: " + e.getMessage());
            return ""; // Return empty string if logo not found
        }
    }

    @Override
    public ApiResponse<PageResponse<LCResponseDTO>> searchLC(
            String search,
            @NonNull Pageable pageable) {

        if (search == null || search.isBlank()) {
            return new ApiResponse<>(false, "Search parameter cannot be empty", null);
        }

        Specification<LeavingCertificate> spec = LeavingCertificateSpecification.getLCSpecification(search);

        Page<LeavingCertificate> page = leavingCertificateRepository.findAll(spec, pageable);

        Page<LCResponseDTO> dtoPage = page.map(student -> modelMapper.map(student, LCResponseDTO.class));

        PageResponse<LCResponseDTO> pageResponse = new PageResponse<>(
                dtoPage.getContent(),
                dtoPage.getNumber(),
                dtoPage.getSize(),
                dtoPage.getTotalElements(),
                dtoPage.getTotalPages());

        return new ApiResponse<>(true, "Search successful", pageResponse);
    }

    @Override
    public ApiResponse<Void> updateLC(Long id, LeavingCertificateDTO entity) {

        try {
            LeavingCertificate lc = leavingCertificateRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("LC not found for id: " + id));

            // ---------------- VALIDATION ----------------
            ApiResponse<Void> validationResponse = validateLeavingCertificateDTO(entity);
            if (!validationResponse.isSuccess()) {
                return validationResponse;
            }

            // ---------------- DUPLICATE CHECKS ----------------

            // Aadhaar check (for ALL students)
            if (entity.getUniqueIDAdhar() != null && !entity.getUniqueIDAdhar().isBlank()) {
                boolean aadhaarExists = leavingCertificateRepository
                        .existsByUniqueIDAdharAndIdNot(entity.getUniqueIDAdhar().trim(), id);

                if (aadhaarExists) {
                    return new ApiResponse<>(false,
                            "Aadhaar ID already exists for another student", null);
                }
            }

            boolean isRegularStudent = "FOR REGULAR STUDENT"
                    .equalsIgnoreCase(entity.getStudentType());

            // GR No check (ONLY for regular students)
            if (isRegularStudent) {
                if (entity.getGrNo() == null || entity.getGrNo().isBlank()) {
                    return new ApiResponse<>(false,
                            "GR No is required for regular student", null);
                }

                boolean grExists = leavingCertificateRepository
                        .existsByGrNoAndIdNot(entity.getGrNo().trim(), id);

                if (grExists) {
                    return new ApiResponse<>(false,
                            "GR No already exists for another student", null);
                }
            }

            // ---------------- UPDATE COMMON FIELDS ----------------
            lc.setStudentType(entity.getStudentType().trim());
            lc.setUniqueIDAdhar(entity.getUniqueIDAdhar().trim());
            lc.setStudentName(entity.getStudentName().trim().toUpperCase());
            lc.setMotherName(entity.getMotherName().trim().toUpperCase());
            lc.setNationality(entity.getNationality().trim().toUpperCase());
            lc.setMotherTongue(entity.getMotherTongue().trim().toUpperCase());
            lc.setReligion(entity.getReligion().trim().toUpperCase());
            lc.setCaste(entity.getCaste().trim().toUpperCase());
            lc.setProgress(entity.getProgress().trim().toUpperCase());
            lc.setConduct(entity.getConduct().trim().toUpperCase());
            lc.setPlaceOfBirth(entity.getPlaceOfBirth().trim().toUpperCase());
            lc.setDateOfBirth(entity.getDateOfBirth());
            lc.setDateOfBirthWords(entity.getDateOfBirthWords().trim().toUpperCase());
            lc.setLastSchool(entity.getLastSchool().trim().toUpperCase());
            lc.setDateOfAdmission(entity.getDateOfAdmission());
            lc.setDateOfLeaving(entity.getDateOfLeaving());
            lc.setStandard(entity.getStandard().trim().toUpperCase());
            lc.setReasonForLeaving(entity.getReasonForLeaving().trim().toUpperCase());
            lc.setRemarks(entity.getRemarks().trim().toUpperCase());
            lc.setIsDuplicate(entity.getIsDuplicate());

            // ---------------- CONDITIONAL FIELDS ----------------
            if (!isRegularStudent) {
                // PRIVATE STUDENT
                lc.setGrNo(null);
                lc.setStudentPEN(null);
                lc.setStudentApaarID(null);
                lc.setStudentID(null);
            } else {
                // REGULAR STUDENT
                lc.setGrNo(entity.getGrNo().trim());
                lc.setStudentPEN(entity.getStudentPEN() != null ? entity.getStudentPEN().trim() : null);
                lc.setStudentApaarID(entity.getStudentApaarID() != null ? entity.getStudentApaarID().trim() : null);
                lc.setStudentID(entity.getStudentID() != null ? entity.getStudentID().trim() : null);
            }

            leavingCertificateRepository.save(lc);

            return new ApiResponse<>(true, "LC updated successfully", null);

        } catch (Exception e) {
            return new ApiResponse<>(false,
                    "Error updating LC: " + e.getMessage(), null);
        }
    }

    @Override
    public ApiResponse<LeavingCertificateDTO> getLCById(Long id) {
        try {
            LeavingCertificate lc = leavingCertificateRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("LC not found for id: " + id));
            LeavingCertificateDTO dto = modelMapper.map(lc, LeavingCertificateDTO.class);
            return new ApiResponse<>(true, "LC retrieved successfully", dto);
        } catch (Exception e) {
            return new ApiResponse<>(false, "Error retrieving LC: " + e.getMessage(), null);
        }

    }

}
