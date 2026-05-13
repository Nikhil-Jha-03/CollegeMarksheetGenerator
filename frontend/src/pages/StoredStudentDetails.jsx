import React, { useEffect, useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Trash, Loader2, X, Download, MoreVertical } from 'lucide-react';
import Templete from './Templete'
import Swal from "sweetalert2";;
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const StoredStudentDetails = () => {

    const navigate = useNavigate()
    const [studentsData, setStudentsData] = useState([]);
    const [pageSize, setPageSize] = useState(5);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElement, setTotalElement] = useState(0);
    const firstRender = useRef(true);
    const [loading, setLoading] = useState(true);
    const [preview, setPreview] = useState(false)
    const [previewData, setPreviewData] = useState({})
    const [searchBy, setSearchBy] = useState('grNo')
    const [search, setSearch] = useState('')
    const [tableLoading, setTableLoading] = useState(false);

    // Loading states for buttons
    const [downloadingAll, setDownloadingAll] = useState(false);
    const [downloadingExcel, setDownloadingExcel] = useState(false);
    const [deletingAll, setDeletingAll] = useState(false);
    const [batchHallTicket, setBatchHallTicket] = useState(false);
    const [downloadingStudent, setDownloadingStudent] = useState({});
    const [deletingStudent, setDeletingStudent] = useState({});
    const [GenerateHallTicket, setGenerateHallTicket] = useState({});



    const allowedKeys = [
        "name",
        "grNo",
        "rollNo",
        // "motherName",
        // "studentClass",
        // "result"
    ];

    // ------------ FETCH DATA -------------
    const fetchStudentDetails = async () => {
        if (studentsData.length === 0) {
            setLoading(true);
        } else {
            setTableLoading(true);
        }

        try {
            const response = await api.get(`/student/getsavedstudent?page=${page}&size=${pageSize}&searchBy=${searchBy}&search=${search}`, { withCredentials: true });

            if (response?.data?.success) {
                setStudentsData(response.data.data.content);
                setTotalPages(response.data.data.totalPages);
                setTotalElement(response.data.data.totalElements)
            }

        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
            setTableLoading(false);
        }
    };

    const toggleView = () => {
        setPreview(false)
        setPreviewData({})
    }

    const handlePreview = (grNo) => {
        if (!grNo && grNo < 0) {
            toast.error("Unable to preview")
            return
        }

        const student = studentsData.find(item => item.grNo == grNo)
        if (student) {
            setPreview(true);
            setPreviewData(student)
            return
        }
        return
    }

    const handleDelete = async (grNo) => {
        const numericGrno = parseInt(grNo);

        if (isNaN(numericGrno) || numericGrno <= 0) {
            toast.error("Unable to delete");
            return;
        }

        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: "This student will be permanently deleted",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#d33"
        });

        if (!confirm.isConfirmed) return;

        setDeletingStudent(prev => ({ ...prev, [numericGrno]: true }));

        try {
            const response = await api.get(`/student/delete/${numericGrno}`, { withCredentials: true });

            if (!response.data?.success) {
                toast.error(response.data.message || "Something went wrong");
                return;
            }

            toast.success("Student Deleted");
            fetchStudentDetails();

        } catch (error) {
            toast.error(error.response?.data?.message || "Delete failed");
        } finally {
            setDeletingStudent(prev => ({ ...prev, [numericGrno]: false }));
        }
    };

    const handleDeleteAll = async () => {
        try {
            // First confirmation
            const firstConfirm = await Swal.fire({
                title: "⚠️ Delete All Students?",
                text: "This will permanently delete ALL student records from the database",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, continue",
                cancelButtonText: "Cancel",
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6"
            });

            if (!firstConfirm.isConfirmed) return;

            // Second confirmation with input verification
            const secondConfirm = await Swal.fire({
                title: "Final Confirmation Required",
                html: `
                <p style="color: #d33; font-weight: bold; margin-bottom: 10px;">
                    ⚠️ THIS ACTION CANNOT BE UNDONE!
                </p>
                <p style="margin-bottom: 15px;">
                    Type <strong>DELETE ALL</strong> to confirm
                </p>
            `,
                input: "text",
                inputPlaceholder: "Type DELETE ALL here",
                icon: "error",
                showCancelButton: true,
                confirmButtonText: "Delete Everything",
                cancelButtonText: "Cancel",
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                inputValidator: (value) => {
                    if (value !== "DELETE ALL") {
                        return "Please type DELETE ALL exactly to confirm";
                    }
                }
            });

            if (!secondConfirm.isConfirmed) return;

            setDeletingAll(true);

            // Make API call
            const response = await api.delete('/student/deleteAllStudents', {
                withCredentials: true
            });

            if (!response?.data?.success) {
                await Swal.fire({
                    title: "Error!",
                    text: response?.data?.message || "Failed to delete students",
                    icon: "error",
                    confirmButtonColor: "#3085d6"
                });
                return;
            }

            // Success message
            await Swal.fire({
                title: "Deleted!",
                text: response?.data?.message || "All students deleted successfully",
                icon: "success",
                confirmButtonColor: "#3085d6"
            });

            fetchStudentDetails();

        } catch (error) {
            console.error("Delete all error:", error);

            await Swal.fire({
                title: "Error!",
                text: error?.response?.data?.message || "An error occurred while deleting students",
                icon: "error",
                confirmButtonColor: "#3085d6"
            });
        } finally {
            setDeletingAll(false);
        }
    };

    const handleDownload = async (grNo, name) => {
        const numericGrno = parseInt(grNo);

        if (isNaN(numericGrno) || numericGrno <= 0) {
            toast.error("Unable to download");
            return;
        }

        setDownloadingStudent(prev => ({ ...prev, [numericGrno]: true }));

        try {
            const response = await api.get(`/api/student/pdf/${numericGrno}`, {
                responseType: 'blob',
                withCredentials: true

            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Report_Card_${name || "report_card"}.pdf`;

            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("Result Downloaded")
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setDownloadingStudent(prev => ({ ...prev, [numericGrno]: false }));
        }
    }

    const handleDownloadAll = async () => {
        setDownloadingAll(true);
        try {

            const response = await api.get("/api/student/pdf/all", {
                responseType: 'blob',
                withCredentials: true
            });

            const blob = new Blob([response.data], { type: 'application/zip' })
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = "students_Details.zip";

            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("Result Downloaded")

        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setDownloadingAll(false);
        }
    }

    const handleEdit = async (grNo) => {
        const numericGrno = parseInt(grNo);

        if (isNaN(numericGrno) || numericGrno <= 0) {
            toast.error("Unable to edit");
            return;
        }

        navigate(`/editstudent/${grNo}`)
        return;
    }

    const downloadExcel = async () => {
        setDownloadingExcel(true);
        try {
            toast.info("Fetching student data...");

            // Fetch data from backend
            const response = await api.get('/student/getAllStudent', {
                withCredentials: true
            });

            if (!response?.data?.success) {
                toast.error(response?.data?.message || "Failed to fetch student data");
                return;
            }

            const newStudentsData = response.data.data; // Adjust based on your API response structure

            // Validate data
            if (!newStudentsData || newStudentsData.length === 0) {
                toast.warning("No student records found to export");
                return;
            }

            // Get all unique subjects across all students
            const allSubjects = new Set();
            newStudentsData.forEach(student => {
                if (student.subjects && Array.isArray(student.subjects)) {
                    student.subjects.forEach(sub => {
                        allSubjects.add(sub.subjectName);
                    });
                }
            });

            // Convert to sorted array for consistent column order
            const subjectList = Array.from(allSubjects).sort();

            // Flatten student data with individual subject columns
            const flattened = newStudentsData.map((s) => {
                const row = {
                    'Name': s.name || "-",
                    'GR No': s.grNo || "-",
                    'Roll No': s.rollNo || "-",
                    'Annual Result': s.annualResult || "-",
                    'Mother Name': s.motherName || "-",
                    'Class': s.studentClass || "-",
                    'DOB': s.dob || "-",
                    'Date of Issue': s.dateOfIssue || "-",
                };

                // Add each subject as a separate column
                subjectList.forEach(subjectName => {
                    const subject = s.subjects?.find(sub => sub.subjectName === subjectName);
                    if (subject) {
                        // For graded subjects
                        if (subject.total === "GRADE") {
                            row[subjectName] = subject.obtained || "-";
                        } else {
                            // For marks-based subjects
                            row[subjectName] = subject.obtained
                                ? `${subject.obtained}/${subject.total}`
                                : `-/${subject.total}`;
                        }
                    } else {
                        row[subjectName] = "-";
                    }
                });

                // Add summary fields at the end
                row['Total Marks'] = s.totalMarks || 0;
                row['Obtained Marks'] = s.obtainedMarks || 0;
                row['Percentage'] = s.percentage ? `${s.percentage}%` : "0%";
                row['Result'] = s.result || "-";
                row['Remark'] = s.remark || "-";

                return row;
            });

            // Create worksheet from data
            const worksheet = XLSX.utils.json_to_sheet(flattened);

            // Auto-size columns
            const maxWidth = 50;
            const colWidths = [];
            const headers = Object.keys(flattened[0] || {});

            headers.forEach((header, i) => {
                const maxLength = Math.max(
                    header.length,
                    ...flattened.map(row => String(row[header] || '').length)
                );
                colWidths[i] = { wch: Math.min(maxLength + 2, maxWidth) };
            });

            worksheet['!cols'] = colWidths;

            // Create workbook and add worksheet
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Student Records");

            // Generate filename with current date
            const fileName = `Student_Report_${new Date().toISOString().split('T')[0]}.xlsx`;

            // Download file
            XLSX.writeFile(workbook, fileName);

            toast.success(`Excel file downloaded successfully! (${newStudentsData.length} records)`);
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Failed to download Excel file. Please try again.");
        } finally {
            setDownloadingExcel(false);
        }
    };

    const handleGenerateHallTicket = async (student) => {
        setGenerateHallTicket(prev => ({ ...prev, [student.grNo]: true }));

        try {
            const response = await api.get(`/student/hallTicket/${student.grNo}`, {
                responseType: 'blob',
                withCredentials: true
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `hall_ticket_${student.grNo}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("hall Ticket Downloaded")

        } catch (error) {
            toast.error("Something Went Wrong")
        } finally {
            setGenerateHallTicket(prev => ({ ...prev, [student.grNo]: false }));
        }

    };

    const batchLcDownload = async () => {
        setBatchHallTicket(true)

        try {
            const response = await api.get("/student/batchHallTicketDownload", { withCredentials: true, responseType: 'blob' })

            const blob = new Blob([response.data], { type: 'application/zip' })
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = "students_Hall_Ticket.zip";

            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("Result Downloaded")
        } catch (error) {
            toast.error("Something went wrong")

        } finally {
            setBatchHallTicket(false)
        }

    }

    // ------------ DEBOUNCE FETCH -------------
    useEffect(() => {
        fetchStudentDetails();
    }, [page, pageSize]);

    useEffect(() => {

        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            fetchStudentDetails();
        }, 400);

        return () => clearTimeout(timeout);

    }, [search]);
    if (preview) {
        return (
            <div className='w-full bg-gray-50'>
                <div className="min-h-screen w-fit m-auto bg-gray-50 p-6">
                    <button
                        onClick={toggleView}
                        className="mb-4 px-6 py-3 bg-gray-800 text-white text-base font-medium"
                    >
                        ← Back to Form
                    </button>
                    <Templete student={previewData} />
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="overflow-x-auto min-h-screen poppins mt-10">

                {/* TOP BAR */}
                <div className='w-7xl m-auto mt-5 items-center'>
                    <h1 className='text-3xl font-bold text-gray-900 mb-1'>Student Details</h1>
                    <p className="text-gray-600 text-sm">Manage and view all student marksheets</p>
                </div>

                <div className='w-7xl m-auto mt-7'>

                    <div className='bg-white border border-gray-200 shadow-sm rounded-xl px-5 py-4 flex items-center justify-between'>

                        {/* LEFT SECTION */}
                        <div className='flex items-center gap-6'>

                            {/* Rows */}
                            <label
                                htmlFor="rows"
                                className="inline-flex items-center gap-2 text-sm font-medium text-gray-700"
                            >
                                <span>Rows</span>

                                <select
                                    id="rows"
                                    value={pageSize}
                                    onChange={(e) => {
                                        const v = Number(e.target.value);

                                        if (v !== pageSize) {
                                            setPage(0);
                                            setPageSize(v);
                                        }
                                    }}
                                    className="text-sm rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </label>

                            {/* Page Info */}
                            <div className='flex gap-2 items-center text-sm text-gray-700'>
                                <span>Page</span>

                                <span className="font-semibold bg-gray-100 px-2 py-1 rounded">
                                    {page + 1}
                                </span>

                                <span>of</span>

                                <span className="font-semibold">
                                    {totalPages}
                                </span>
                            </div>

                        </div>

                        {/* RIGHT SECTION */}
                        <div className='flex items-center gap-3'>

                            {/* Main Action */}
                            <Button
                                className="cursor-pointer"
                                disabled={downloadingAll}
                                onClick={handleDownloadAll}
                            >
                                {downloadingAll && (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                )}

                                Download All
                            </Button>

                            {/* Dropdown Actions */}
                            <DropdownMenu>

                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="cursor-pointer"
                                    >
                                        <MoreVertical className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-56">

                                    <DropdownMenuItem onClick={downloadExcel}>
                                        {downloadingExcel && (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        )}
                                        Excel Download
                                    </DropdownMenuItem>

                                    <DropdownMenuItem onClick={batchLcDownload}>
                                        {batchHallTicket && (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        )}
                                        Hall Ticket Download
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        onClick={handleDeleteAll}
                                        className="text-red-600 focus:text-red-600"
                                    >
                                        {deletingAll && (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        )}
                                        Delete All Student Record
                                    </DropdownMenuItem>

                                </DropdownMenuContent>

                            </DropdownMenu>

                        </div>

                    </div>

                </div>

                {/* Search */}
                <div className='w-7xl m-auto table-fade mt-8'>
                    <div className='flex gap-2'>
                        <label htmlFor="searchBy">

                            <select
                                onChange={(e) => setSearchBy(e.currentTarget.value)}
                                value={searchBy}
                                className='text-sm rounded-md border px-2 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring uppercase' name="grNo" id="searchBy">
                                <option value=""> Select Search Type </option>
                                {allowedKeys.map((key) => (
                                    <option key={key} value={key}>
                                        Search By {key}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label
                            htmlFor="search"
                            className="inline-flex items-center gap-2 text-sm font-medium text-gray-700"
                        >
                            <input
                                onChange={(e) => setSearch(e.target.value)}
                                id="search"
                                name="search"
                                value={search}
                                type="text"
                                placeholder='Seacrch'
                                className="w-sm text-sm rounded-md border px-2 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </label>

                        {search.trim() !== '' && (
                            <div className='flex items-center table-fade'>
                                <span
                                    onClick={() => setSearch('')}
                                >

                                    <Button className="cursor-pointer"><X />Clear Search</Button>
                                </span>

                            </div>
                        )}

                    </div>
                </div>

                {/* MAIN CONTENT */}
                {loading ? (
                    // ------------------ BIG CENTERED LOADER ------------------
                    <div className="w-5xl m-auto flex justify-center mt-32 text-zinc-500">
                        <Loader2 className="h-10 w-10 animate-spin" />
                    </div>

                ) : studentsData.length > 0 ? (


                    <div className='w-7xl m-auto table-fade mt-9 px-4 relative'>

                        {tableLoading && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-20 rounded-md">
                                <Loader2 className="h-7 w-7 animate-spin text-gray-600" />
                            </div>
                        )}


                        <table className="min-w-full border-collapse border border-gray-300 mt-5 shadow-lg">
                            <thead>
                                <tr className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">GR No</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-full">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Class</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Result</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Preview</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Edit</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Print</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Delete</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Hall Ticket</th>
                                </tr>
                            </thead>

                            <tbody>
                                {studentsData.map((student, index) => (
                                    <tr key={student.grNo} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {student.grNo}
                                        </td>
                                        <td className="px-4 py-3 w-full text-sm text-gray-900">
                                            {student.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {student.studentClass}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${student.result === 'Pass'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {student.result}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span onClick={() => handlePreview(student.grNo | null)}>
                                                <Button className="cursor-pointer" variant="secondary">Preview</Button>
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span onClick={() => handleEdit(student.grNo || null)}>
                                                <Button className="cursor-pointer" variant="secondary">Edit</Button>
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span onClick={() => handleDownload(student.grNo || null, student.name || "report_card")}>
                                                <Button className="cursor-pointer" disabled={downloadingStudent[student.grNo]}>
                                                    {downloadingStudent[student.grNo] && (
                                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                    )}
                                                    Print
                                                </Button>
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span onClick={() => handleDelete(student.grNo || null)}>
                                                <Button
                                                    className="cursor-pointer"
                                                    variant="destructive"
                                                    disabled={deletingStudent[student.grNo]}
                                                >
                                                    {deletingStudent[student.grNo] ? (
                                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                    ) : (
                                                        <Trash className="h-4 w-4 mr-1" />
                                                    )}
                                                    Delete
                                                </Button>
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap flex justify-center">
                                            <span onClick={() => handleGenerateHallTicket(student)}>
                                                <Button
                                                    className="cursor-pointer"
                                                    variant="outline"
                                                    disabled={GenerateHallTicket[student.grNo]}
                                                >
                                                    {GenerateHallTicket[student.grNo] ? (
                                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                    ) : (
                                                        <Download className="h-4 w-4 mr-1" />
                                                    )}
                                                </Button>
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className='mt-6 flex justify-center items-center'>
                            <div className='flex gap-3'>
                                <Button variant="outline" disabled={page <= 0} onClick={() => setPage(0)}>
                                    First Page
                                </Button>
                                <Button variant="outline" disabled={page <= 0} onClick={() => setPage(page - 1)}>
                                    Previous
                                </Button>
                                <Button variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                                    Next
                                </Button>
                                <Button variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}>
                                    Last Page
                                </Button>
                            </div>
                        </div>
                    </div>

                ) : (
                    // ------------------ NO DATA ------------------
                    <div className='w-5xl m-auto flex justify-center mt-32 text-3xl font-semibold text-zinc-400'>
                        <h1>No Data Available</h1>
                    </div>
                )}

            </div>
        </div>
    );
};

export default StoredStudentDetails;