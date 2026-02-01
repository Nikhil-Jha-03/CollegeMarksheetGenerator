package com.nikhil.backend.services.implementation;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.itextpdf.html2pdf.ConverterProperties;
import com.itextpdf.html2pdf.HtmlConverter;
import com.nikhil.backend.BackendApplication;
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

    private String normalizeString(String input) {
        return input == null ? null : input.trim().toUpperCase();
    }

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
        student2.setMotherName(normalizeString(entity.getMotherName()));
        student2.setName(normalizeString(entity.getName()));
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

    @Transactional
    @Override
    public ApiResponse<Void> updateStudent(Long grno, StudentDetailDTO dto) {

        Student student = studentRepository.findByGrNo(grno);

        if (student == null) {
            return new ApiResponse<>(false, "Student not found", null);
        }

        // 🔐 Check if GR No is changing
        if (student.getGrNo() != dto.getGrNo()) {
            Student existingStudent = studentRepository.findByGrNo(dto.getGrNo());
            if (existingStudent != null) {
                return new ApiResponse<>(false, "GR No already exists", null);
            }
            student.setGrNo(dto.getGrNo());
        }
        // Update other fields
        student.setName(normalizeString(dto.getName()));
        student.setMotherName(normalizeString(dto.getMotherName()));
        student.setStudentClass(dto.getStudentClass());
        student.setAnnualResult(dto.getAnnualResult());
        student.setDob(dto.getDob());
        student.setDateOfIssue(dto.getDateOfIssue());
        student.setTotalMarks(dto.getTotalMarks());
        student.setObtainedMarks(dto.getObtainedMarks());
        student.setPercentage(dto.getPercentage());
        student.setResult(dto.getResult());
        student.setRemark(dto.getRemark());

        // 🔄 Update subjects
        student.getSubjects().clear(); // orphanRemoval = true

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
    public ApiResponse<List<FinalStudentDetailDTO>> getAll() {
        List<Student> students = studentRepository.findAll();

        if (students.isEmpty()) {
            return new ApiResponse<>(false, "No students found", null);
        }

        // Map all students to DTOs
        List<FinalStudentDetailDTO> studentDTOs = students.stream()
                .map(student -> modelMapper.map(student, FinalStudentDetailDTO.class))
                .collect(Collectors.toList());

        return new ApiResponse<>(true, "Students fetched successfully", studentDTOs);
    }

    @Override
    public ApiResponse<Void> deleteAll() {
        try {
            // Get count before deletion for response message
            long count = studentRepository.count();

            if (count == 0) {
                return new ApiResponse<>(false, "No students found to delete", null);
            }

            // Delete all students
            studentRepository.deleteAll();

            return new ApiResponse<>(
                    true,
                    " student record(s) deleted successfully",
                    null);

        } catch (Exception e) {
            return new ApiResponse<>(
                    false,
                    "Failed to delete students: " + e.getMessage(),
                    null);
        }
    }

    @Override
    public byte[] generateHallTicket(Long grno) {
        try {

            Student student = studentRepository.findByGrNo(grno);
            if (student == null) {
                return null;
            }

            // ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            String htmlContent = generateHT(modelMapper.map(student, FinalStudentDetailDTO.class));

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            ConverterProperties converterProperties = new ConverterProperties();
            converterProperties.setBaseUri("classpath:/static/");
            HtmlConverter.convertToPdf(htmlContent, outputStream, converterProperties);
            return outputStream.toByteArray();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to generate LC PDF", e);
        }
    }

    private String generateHT(FinalStudentDetailDTO student) {

        DateTimeFormatter df = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        String dob = student.getDob() != null ? student.getDob().format(df) : "";

        String logoBase64 = getLogoAsBase64(); // should include data:image/png;base64,...

        StringBuilder html = new StringBuilder();

        html.append("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                """);

        html.append(getCssStyles());

        html.append("""
                                    </style>
                                </head>
                                <body>

                                <div class="hall-ticket">

                                    <div class="watermark-bg">
                    PRAGNYA &nbsp;&nbsp; PRAGNYA &nbsp;&nbsp; PRAGNYA <br><br>
                    PRAGNYA &nbsp;&nbsp; PRAGNYA &nbsp;&nbsp; PRAGNYA <br><br>
                    PRAGNYA &nbsp;&nbsp; PRAGNYA &nbsp;&nbsp; PRAGNYA <br><br>
                    PRAGNYA &nbsp;&nbsp; PRAGNYA &nbsp;&nbsp; PRAGNYA <br><br>
                    PRAGNYA &nbsp;&nbsp; PRAGNYA &nbsp;&nbsp; PRAGNYA
                </div>

                                    <div class="content-layer">
                                """);

        /* ================= HEADER (LC STYLE) ================= */

        html.append("""
                    <div class="header-box">

                        <div class="logo-container">
                """);

        if (logoBase64 != null && !logoBase64.isEmpty()) {
            html.append("""
                        <img src="%s" class="logo">
                    """.formatted(logoBase64));
        }

        html.append("""
                        </div>

                        <div class="college-info">
                            <div class="trust-name">Pragnya Educational Trust's</div>
                            <div class="college-name">
                                PRAGNYA JUNIOR COLLEGE OF ARTS, COMMERCE & SCIENCE
                            </div>
                            <div class="board-info">(Approved by Maharashtra State Board)</div>
                            <div class="address-line">
                                Address: Sr. No.-25/1/1, Village Handewadi/Autade,
                                off Katraj – Saswad by pass Road<br>
                                Tal.- Haveli, Po.- Urli-Devachi, Pin. No. - 412308
                            </div>
                            <div class="contact-line">
                                Index No.: J11.15.092 | U-DISE NO.: 27250500703
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

        /* ================= EXAM TITLE ================= */

        html.append("""
                <div class="exam-title">
                    HALL TICKET FOR ANNUAL EXAMINATION %s
                </div>
                """.formatted(student.getAnnualResult()));

        /* ================= TOP INFO TABLE ================= */

        html.append("""
                <table class="top-info-table">
                    <thead>
                        <tr>
                            <th>Seat No / Roll No</th>
                            <th>G.R. No</th>
                            <th>Center Code</th>
                            <th>College Code</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>%s</td>
                            <td>%s</td>
                            <td>J11.15.092</td>
                            <td>1115092</td>
                        </tr>
                    </tbody>
                </table>
                """.formatted(
                student.getRollNo(),
                student.getGrNo()));

        /* ================= STUDENT DETAILS ================= */

        html.append("""
                <table class="student-info-table">
                    <tr>
                        <td class="details-text">
                            <div><strong>Student Name:</strong> %s</div>
                            <div><strong>Mother's Name:</strong> %s</div>
                            <div><strong>Date of Birth:</strong> %s</div>
                            <div><strong>Stream:</strong> %s</div>
                            <div><strong>Academic Year:</strong> %s</div>
                        </td>
                        <td class="photo-cell">
                            <div class="photo-box">
                                STUDENT<br>PHOTO
                            </div>
                        </td>
                    </tr>
                </table>
                """.formatted(
                student.getName(),
                student.getMotherName(),
                dob,
                student.getStudentClass(),
                student.getAnnualResult()));

        /* ================= SUBJECT TABLE ================= */

        html.append("""
                <table class="subject-table">
                    <thead>
                        <tr>
                            <th style="width:50%;">Subject Name</th>
                            <th style="width:25%;">Exam Date</th>
                            <th style="width:25%;">Exam Time</th>
                        </tr>
                    </thead>
                    <tbody>
                """);

        if (student.getSubjects() != null) {
            for (StudentSubjectDTO s : student.getSubjects()) {
                html.append("""
                            <tr>
                                <td>%s</td>
                                <td></td>
                                <td></td>
                            </tr>
                        """.formatted(s.getSubjectName()));
            }
        }

        html.append(
                """
                                                            </tbody>
                                                        </table>

                                                        <div class="instructions">
                                                            <strong>IMPORTANT INSTRUCTIONS:</strong>
                                                            <ul>
                            <li>Candidates must verify the <strong>exam date, time, and subject</strong> as per the official timetable.</li>
                            <li>Ensure all details on the Hall Ticket such as <strong>Name, Photograph, G.R. No., and Subjects</strong> are correct. Contact the College Exam Office in case of any discrepancy.</li>
                            <li>It is <strong>mandatory</strong> to carry this Hall Ticket along with a <strong>valid College Identity Card</strong>.</li>
                            <li>Candidates must reach the examination centre <strong>at least 30 minutes before</strong> the commencement of the examination.</li>
                            <li><strong>Mobile phones, smart watches, calculators, and electronic gadgets</strong> are strictly prohibited inside the examination hall.</li>
                            <li>Students must strictly follow the <strong>instructions given by the invigilators</strong> during the examination.</li>
                        </ul>

                                                        </div>

                                                       <div class="footer-wrapper">
                            <table class="footer-table">
                                <tr>
                                    <td class="signature-box">
                                        <div class="signature-line"></div>
                                        Signature of Student
                                    </td>

                                    <td></td>

                                    <td class="signature-box">
                                        <div class="signature-line"></div>
                                        College Principal / Director<br>
                                        <span class="stamp-text">PRAGNYA JUNIOR COLLEGE</span>
                                    </td>
                                </tr>
                            </table>
                        </div>


                                                        </div>
                                                        </div>

                                                        </body>
                                                        </html>
                                                    """);

        return html.toString();
    }

    private String getCssStyles() {
        return """
                        @page { size: A4; margin: 0; }

                        body {
                            font-family: 'Times New Roman', serif;
                            margin: 0;
                            padding: 0;
                        }

                        .hall-ticket {
                            width: 210mm;
                            height: 297mm;
                            padding: 25px;
                            position: relative;
                            box-sizing: border-box;
                        }

                        /* ================= WATERMARK ================= */

                        .watermark-bg {
                            position: absolute;
                            top: 20%;
                            left: 0;
                            width: 100%;
                            text-align: center;
                            font-size: 60px;
                            font-weight: bold;
                            color: #000;
                            opacity: 0.07;
                            transform: rotate(-30deg);
                            line-height: 120px;
                            white-space: nowrap;
                            pointer-events: none;
                            z-index: 0;
                        }

                        .content-layer {
                            position: relative;
                            z-index: 1;
                            padding-bottom: 120px; /* space for footer */
                        }

                        /* ================= HEADER ================= */

                        .header-box {
                            position: relative;
                            padding: 10px 5px;
                            margin-bottom: 5px;
                            min-height: 100px;
                        }

                        .logo-container {
                            position: absolute;
                            left: 10px;
                            top: 5px;
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
                            padding: 0 10px;
                        }

                        .trust-name {
                            font-size: 8pt;
                            font-weight: 600;
                            margin-bottom: 2px;
                        }

                        .college-name {
                            font-size: 13pt;
                            font-weight: bold;
                            text-transform: uppercase;
                            margin-bottom: 2px;
                            color: #222;
                        }

                        .board-info {
                            font-size: 8pt;
                            margin-bottom: 2px;
                        }

                        .address-line,
                        .contact-line {
                            font-size: 7.5pt;
                            line-height: 1.2;
                        }

                        .index-strip {
                            border-top: 3px double #000;
                            border-bottom: 3px double #000;
                            padding: 3px 0;
                            margin-bottom: 10px;
                        }

                        .plain-table {
                            width: 100%;
                            border-collapse: collapse;
                        }

                        .plain-table td {
                            font-weight: bold;
                            font-size: 9pt;
                            border: none;
                        }

                        /* ================= EXAM TITLE ================= */

                        .exam-title {
                            text-align: center;
                            font-weight: bold;
                            font-size: 16px;
                            border: 1px solid #000;
                            padding: 8px;
                            background: #eee;
                            margin: 15px 0;
                        }

                        /* ================= COMMON TABLES ================= */

                        .top-info-table,
                        .subject-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 15px;
                            text-align: center;
                            table-layout: fixed;
                        }

                        .top-info-table th,
                        .top-info-table td,
                        .subject-table th,
                        .subject-table td {
                            border: 1px solid #000;
                            padding: 6px;
                            font-size: 13px;
                        }

                        /* Seat No / Roll No */
                .top-info-table th:nth-child(1),
                .top-info-table td:nth-child(1) {
                    width: 25%;
                }

                /* G.R. No */
                .top-info-table th:nth-child(2),
                .top-info-table td:nth-child(2) {
                    width: 25%;
                }

                /* Center Code */
                .top-info-table th:nth-child(3),
                .top-info-table td:nth-child(3) {
                    width: 25%;
                }

                /* College Code */
                .top-info-table th:nth-child(4),
                .top-info-table td:nth-child(4) {
                    width: 25%;
                }

                        .subject-table td:first-child {
                            text-align: left;
                            padding-left: 10px;
                            white-space: normal;
                        }

                        /* ================= STUDENT INFO (FIXED LAYOUT) ================= */

                        .student-info-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 15px;
                            table-layout: fixed;   /* 🔥 PREVENT WIDTH CHANGES */
                        }

                        .student-info-table td {
                            border: 1px solid #000;
                            padding: 6px;
                            font-size: 13px;
                            vertical-align: top;
                        }

                        /* LEFT: student details */
                        .student-info-table td:first-child {
                            width: 70%;
                        }

                        /* RIGHT: photo column */
                        .student-info-table td:last-child {
                            width: 30%;
                            text-align: center;
                            vertical-align: middle;
                        }

                        .details-text {
                            text-align: left;
                            line-height: 1.8;
                            padding: 10px;
                            word-wrap: break-word;
                            overflow-wrap: break-word;
                        }

                        .details-text strong {
                            display: inline-block;
                            width: 120px;
                        }

                        .photo-box {
                    width: 110px;
                    height: 130px;
                    border: 1px solid #000;

                    margin: 0 auto;          /* center horizontally */
                    display: flex;           /* 🔥 better centering */
                    align-items: center;
                    justify-content: center;

                    font-size: 10px;
                    box-sizing: border-box;
                }


                        /* ================= INSTRUCTIONS ================= */

                        .instructions {
                            border: 1px solid #999;
                            padding: 10px;
                            font-size: 11px;
                        }

                        /* ================= FOOTER ================= */

                        .footer-wrapper {
                            position: absolute;
                            bottom: -30px;
                            left: 25px;
                            right: 25px;
                        }

                        .footer-table {
                            width: 100%;
                            border-collapse: collapse;
                        }

                        .signature-box {
                            width: 200px;
                            text-align: center;
                        }

                        .signature-line {
                            height: 40px;
                            border-bottom: 1px solid #000;
                            margin-bottom: 5px;
                        }

                        .stamp-text {
                            font-size: 10px;
                        }
                    """;
    }

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

    private String safe(Object val) {
        return val == null ? "" : val.toString();
    }

    private byte[] helperGenHT(FinalStudentDetailDTO student) {
        try {
            String htmlContent = generateHT(student);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            ConverterProperties converterProperties = new ConverterProperties();
            converterProperties.setBaseUri("classpath:/static/");
            HtmlConverter.convertToPdf(htmlContent, outputStream, converterProperties);
            return outputStream.toByteArray();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to generate LC PDF", e);
        }
    }

    @Override
    public byte[] batchHallTicketDownload() {

        List<FinalStudentDetailDTO> students = getAllStudent();

        if (students.isEmpty()) {
            throw new RuntimeException("No students found in database");
        }

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ZipOutputStream zipOut = new ZipOutputStream(baos)) {

            int successCount = 0;
            int failCount = 0;

            for (FinalStudentDetailDTO items : students) {

                try {

                    byte[] newData = helperGenHT(items);

                    String fileName = sanitizeFileName(
                            String.format("Hall_Ticket_%s_%s.pdf",
                                    items.getName(),
                                    items.getGrNo()));

                    ZipEntry zipEntry = new ZipEntry(fileName);
                    zipOut.putNextEntry(zipEntry);
                    zipOut.write(newData);
                    zipOut.closeEntry();

                    successCount++;
                } catch (Exception e) {
                    log.error("Failed to generate PDF for student: {} ({})",
                            items.getName(), items.getGrNo(), e);
                    failCount++;
                }

            }
            zipOut.finish();
            log.info("Batch {} completed. Success: {}, Failed: {}",
                    successCount, failCount);

            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Error creating ZIP file for batch: {}", e);
            throw new RuntimeException("Failed to create batch PDF ZIP", e);
        }
    }

    private String sanitizeFileName(String fileName) {
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

}
