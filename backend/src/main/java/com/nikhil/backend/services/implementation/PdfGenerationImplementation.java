package com.nikhil.backend.services.implementation;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.itextpdf.html2pdf.ConverterProperties;
import com.itextpdf.html2pdf.HtmlConverter;
import com.nikhil.backend.dto.FinalStudentDetailDTO;
import com.nikhil.backend.dto.StudentSubjectDTO;
import com.nikhil.backend.services.PdfGenerationService;
import com.nikhil.backend.services.StudentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PdfGenerationImplementation implements PdfGenerationService {

    private final TemplateEngine templateEngine;
    private final StudentService studentService;

    /**
     * Generate PDF from student data
     * 
     * @param studentData - JSON data from database
     * @return byte array of PDF
     */
    public byte[] generateStudentReport(Map<String, Object> studentData) {
        try {
            // Generate HTML from template
            String htmlContent = generateHtmlContent(studentData);

            // Convert HTML to PDF
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            // Set converter properties for better rendering
            ConverterProperties converterProperties = new ConverterProperties();
            converterProperties.setBaseUri("classpath:/static/");

            HtmlConverter.convertToPdf(htmlContent, outputStream, converterProperties);

            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF: " + e.getMessage(), e);
        }
    }

    private String generateHtmlContent(Map<String, Object> studentData) {
        Context context = new Context();
        context.setVariable("student", studentData);

        return templateEngine.process("report-card-template", context);
    }

    @Override
    public byte[] generateStudentReportDirect(FinalStudentDetailDTO student) {
        try {
            String html = buildHtmlString(student);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            // Set converter properties for better rendering
            ConverterProperties converterProperties = new ConverterProperties();
            converterProperties.setBaseUri("classpath:/static/");

            HtmlConverter.convertToPdf(html, outputStream, converterProperties);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF: " + e.getMessage(), e);
        }
    }

    /**
     * Convert image to Base64 for embedding in HTML
     */
    private String getLogoAsBase64() {
        try {
            // Read logo from resources folder
            // Place your CollegeLogo.png in src/main/resources/static/images/
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

    private String buildHtmlString(FinalStudentDetailDTO student) {
        StringBuilder html = new StringBuilder();

        // Get logo as base64
        String logoBase64 = getLogoAsBase64();

        html.append("<!DOCTYPE html>");
        html.append("<html>");
        html.append("<head>");
        html.append("<meta charset='UTF-8'/>");
        html.append("<style>");
        html.append(getCssStyles());
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class='page'>");
        html.append("<div class='container'>");

        // Logo - centered at top
        if (!logoBase64.isEmpty()) {
            html.append("<div class='logo-container'>");
            html.append("<img src='").append(logoBase64).append("' alt='College Logo' class='logo'/>");
            html.append("</div>");
        }

        // Header
        html.append("<div class='text-center'>");
        html.append("<h1>Pragnya Educational Trust's</h1>");
        html.append("<h2>Pragnya Junior College of Arts, Commerce & Science</h2>");
        html.append("<p>(Approved by Maharashtra State Board)</p>");
        html.append("<p>Handewadi, Hadapsar, Pune</p>");
        html.append("<h2 class='title'>ANNUAL RESULTS ").append(student.getAnnualResult()).append("</h2>");
        html.append("</div>");

        // Student Info Table
        html.append("<table class='info-table'>");
        html.append("<tr>");
        html.append("<td class='label'>Class</td><td class='value'>").append(student.getStudentClass()).append("</td>");
        html.append("<td class='label'>Roll No</td><td class='value'>").append(student.getRollNo()).append("</td>");
        html.append("</tr>");
        html.append("<tr>");
        html.append("<td class='label'>Student Name</td><td class='value'>").append(student.getName()).append("</td>");
        html.append("<td class='label'>Mother's Name</td><td class='value'>").append(student.getMotherName())
                .append("</td>");
        html.append("</tr>");
        html.append("<tr>");
        html.append("<td class='label'>Date of Birth:</td><td class='value'>").append(student.getDob()).append("</td>");
        html.append("<td class='label'>G.R. No.:</td><td class='value'>").append(student.getGrNo()).append("</td>");
        html.append("</tr>");
        html.append("</table>");

        // Subjects Table
        html.append("<table class='subjects-table'>");
        html.append("<thead>");
        html.append("<tr><th>Subjects</th><th>Total Marks</th><th>Obtained Marks</th></tr>");
        html.append("</thead>");
        html.append("<tbody>");

        for (StudentSubjectDTO subject : student.getSubjects()) {
            html.append("<tr>");
            html.append("<td>").append(subject.getSubjectName()).append("</td>");
            html.append("<td class='center'>").append(subject.getTotal()).append("</td>");
            html.append("<td class='center'>").append(
                    subject.getObtained() != null && !subject.getObtained().isEmpty() ? subject.getObtained() : "")
                    .append("</td>");
            html.append("</tr>");
        }

        html.append("</tbody>");
        html.append("</table>");

        // Summary
        html.append("<div class='summary'>");
        html.append("<p><strong>Total Marks:</strong> ").append(student.getTotalMarks()).append("</p>");
        html.append("<p><strong>Obtained Marks:</strong> ").append(student.getObtainedMarks()).append("</p>");
        html.append("<p><strong>Percentage:</strong> ").append(String.format("%.2f", student.getPercentage()))
                .append("%</p>");
        html.append("<p><strong>Result:</strong> ").append(student.getResult()).append("</p>");
        html.append("<p><strong>Remark:</strong> ").append(student.getRemark() != null ? student.getRemark() : "")
                .append("</p>");
        html.append("</div>");

        // Footer
        html.append("<div class='footer'>");
        html.append("<p><strong>Date of Issue:</strong> ").append(student.getDateOfIssue()).append("</p>");
        html.append("</div>");

        // Signatures
        html.append("<div class='signatures'>");
        html.append("<div class='signature-box'><p>Class Teacher</p></div>");
        html.append("<div class='signature-box'><p>Vice-Principal</p></div>");
        html.append("<div class='signature-box'><p>Principal</p></div>");
        html.append("</div>");

        html.append("</div>"); // Close container
        html.append("</div>"); // Close page
        html.append("</body>");
        html.append("</html>");

        return html.toString();
    }

    private String getCssStyles() {
        return """
                    @page {
                        size: A4;
                        margin: 0;
                    }

                    * {
                        box-sizing: border-box;
                    }

                    body {
                        font-family: 'Arial', 'Helvetica', sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: white;
                    }

                    .page {
                        width: 210mm;
                        min-height: 297mm;
                        padding: 0;
                        margin: 0 auto;
                        background: white;
                    }

                    .container {
                        width: 100%;
                        max-width: 190mm;
                        min-height: 277mm;
                        padding: 10mm;
                        margin: 0 auto;
                        background-color: white;
                        color: #1f2937;
                        font-size: 11pt;
                    }

                    .logo-container {
                        text-align: center;
                        margin-bottom: 15px;
                    }

                    .logo {
                        max-width: 120px;
                        max-height: 120px;
                        width: auto;
                        height: auto;
                    }

                    .text-center {
                        text-align: center;
                        margin-bottom: 20px;
                    }

                    h1 {
                        font-size: 16pt;
                        font-weight: bold;
                        margin: 5px 0;
                        color: #000;
                    }

                    h2 {
                        font-size: 14pt;
                        font-weight: 600;
                        margin: 3px 0;
                        color: #000;
                    }

                    .title {
                        margin-top: 12px;
                        text-decoration: underline;
                        font-weight: bold;
                    }

                    p {
                        font-size: 11pt;
                        margin: 3px 0;
                        line-height: 1.4;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                        font-size: 11pt;
                    }

                    .info-table td {
                        border: 1px solid #666;
                        padding: 8px 10px;
                    }

                    .info-table .label {
                        font-weight: normal;
                        width: 25%;
                    }

                    .info-table .value {
                        text-align: center;
                        width: 25%;
                    }

                    .subjects-table th,
                    .subjects-table td {
                        border: 1px solid #666;
                        padding: 8px 10px;
                    }

                    .subjects-table thead {
                        background-color: #e5e7eb;
                    }

                    .subjects-table th {
                        font-weight: 600;
                        text-align: center;
                        color: #000;
                    }

                    .subjects-table td {
                        text-align: left;
                    }

                    .subjects-table td.center {
                        text-align: center;
                    }

                    .subjects-table td:nth-child(2),
                    .subjects-table td:nth-child(3) {
                        text-align: center;
                    }

                    .summary {
                        margin-top: 20px;
                        font-size: 11pt;
                        line-height: 1.6;
                    }

                    .summary p {
                        margin: 5px 0;
                    }

                    .footer {
                        margin-top: 20px;
                        font-size: 11pt;
                    }

                    .signatures {
                        display: table;
                        width: 100%;
                        margin-top: 40px;
                        font-size: 11pt;
                    }

                    .signature-box {
                        display: table-cell;
                        width: 33.33%;
                        text-align: center;
                        vertical-align: bottom;
                        padding: 0 10px;
                    }

                    .signature-box p {
                        margin: 0;
                        padding-top: 50px;
                        border-top: 1px solid transparent;
                    }

                    strong {
                        font-weight: 600;
                    }

                    @media print {
                        .page {
                            margin: 0;
                            border: none;
                            box-shadow: none;
                        }
                    }
                """;
    }

    /**
     * Generate PDFs for all students
     * 
     * @return ZIP file as byte array
     */
    @Override
    public byte[] generateAllStudentPdfs() {

        List<FinalStudentDetailDTO> students = studentService.getAllStudent();

        if (students.isEmpty()) {
            throw new RuntimeException("No students found in database");
        }

        return generateBatchPdfsFromStudents(students, "All_Students");
    }

    private byte[] generateBatchPdfsFromStudents(List<FinalStudentDetailDTO> students, String batchName) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ZipOutputStream zipOut = new ZipOutputStream(baos)) {

            log.info("Starting batch PDF generation for {} students in batch: {}",
                    students.size(), batchName);

            int successCount = 0;
            int failCount = 0;

            for (FinalStudentDetailDTO student : students) {
                try {
                    // Generate PDF
                    byte[] pdfBytes = generateStudentReportDirect(student);

                    // Create filename
                    String fileName = sanitizeFileName(
                            String.format("Report_Card_%s_%s.pdf",
                                    student.getName(),
                                    student.getGrNo()));

                    // Add to ZIP
                    ZipEntry zipEntry = new ZipEntry(fileName);
                    zipOut.putNextEntry(zipEntry);
                    zipOut.write(pdfBytes);
                    zipOut.closeEntry();

                    successCount++;

                } catch (Exception e) {
                    log.error("Failed to generate PDF for student: {} ({})",
                            student.getName(), student.getGrNo(), e);
                    failCount++;
                }
            }

            zipOut.finish();

            log.info("Batch {} completed. Success: {}, Failed: {}",
                    batchName, successCount, failCount);

            return baos.toByteArray();

        } catch (IOException e) {
            log.error("Error creating ZIP file for batch: {}", batchName, e);
            throw new RuntimeException("Failed to create batch PDF ZIP", e);
        }
    }

    /**
     * Sanitize filename to remove invalid characters
     */
    private String sanitizeFileName(String fileName) {
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

}