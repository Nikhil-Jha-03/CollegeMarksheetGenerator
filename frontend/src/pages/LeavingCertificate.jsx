import React, { useState, useRef, useEffect, useCallback } from 'react';
import CollegeLogo from "../assets/CollegeLogo.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parseISO, format } from "date-fns";
import { toWordsOrdinal, toWords } from "number-to-words";
import api from '../api/axios';
import {
    ChessKing,
    Loader2,
    Search,
    Download,
    Edit,
    Trash2,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '../components/ui/button';

// --- Helper Components ---

// 1. Loading Skeleton for Search Results
const SkeletonRow = () => (
    <div className="flex justify-between p-6 items-center border-b animate-pulse bg-white">
        <div className="space-y-3 w-1/2">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
        </div>
        <div className="flex gap-4">
            <div className="h-10 w-24 bg-gray-200 rounded"></div>
            <div className="h-10 w-24 bg-gray-200 rounded"></div>
            <div className="h-10 w-24 bg-gray-200 rounded"></div>
        </div>
    </div>
);

// 2. Badge Helper
const getStudentTypeBadge = (type) => {
    if (type === "FOR REGULAR STUDENT") {
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-200">Regular</span>;
    }
    return <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded border border-purple-200">Private</span>;
};

// --- Main Component ---

const LeavingCertificate = () => {
    // UI Modes
    const [searchMode, setSearchMode] = useState(false);

    // Loading States
    const [saveLoading, setSaveLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);

    // Track specific action loading
    const [actionLoading, setActionLoading] = useState({});

    // Data & Search States
    const [searchText, setSearchText] = useState("");
    const debounceTimeoutRef = useRef(null);
    const [lcRecords, setLcRecords] = useState([]);

    // Pagination State
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0
    });

    // Initial form state
    const initialFormState = {
        studentType: 'FOR PRIVATE STUDENT',
        studentPEN: '',
        uniqueIDAdhar: '',
        studentApaarID: '',
        studentID: '',
        studentName: '',
        isDuplicate: false,
        motherName: '',
        nationality: 'INDIAN',
        motherTongue: '',
        religion: '',
        caste: '',
        progress: '',
        conduct: '',
        placeOfBirth: '',
        dateOfBirth: '',
        dateOfBirthWords: '',
        lastSchool: '',
        dateOfAdmission: '',
        dateOfLeaving: '',
        standard: '',
        reasonForLeaving: 'AS PER STUDENT\'S APPLICATION',
        remarks: '',
        grNo: ''
    };

    // Create Form Data
    const [formData, setFormData] = useState(initialFormState);

    // --- Helpers ---
    const formatDate = (date) => {
        if (!date) return '';
        return format(date, 'yyyy-MM-dd');
    };

    const parseDate = (dateString) => {
        if (!dateString) return null;
        try {
            const date = new Date(dateString);
            const day = toWordsOrdinal(date.getDate());
            const month = format(date, "MMMM");
            const year = toWords(date.getFullYear());
            return `${day} ${month} ${year}`;
        } catch (error) {
            console.error("Error parsing date:", error);
            return null;
        }
    }

    // --- API Interactions ---

    // Unified Fetch Function (using useCallback to fix dependency warning)
    const fetchRecords = useCallback(async (pageNo = 0, search = searchText) => {
        if (!searchMode) return;

        setTableLoading(true);
        try {
            let url = '';
            if (search.trim()) {
                url = `/leavingcertificate/searchLC?search=${encodeURIComponent(search)}&page=${pageNo}&size=${pagination.size}`;
            } else {
                url = `/leavingcertificate/getAllLC?page=${pageNo}&size=${pagination.size}`;
            }

            const response = await api.get(url, { withCredentials: true });

            if (response.data.success) {
                const data = response.data.data;
                const content = data.content ? data.content : (Array.isArray(data) ? data : []);
                const pageInfo = data.totalPages !== undefined ? {
                    page: data.page || pageNo,
                    size: data.size || pagination.size,
                    totalPages: data.totalPages,
                    totalElements: data.totalElements
                } : { ...pagination, page: pageNo };

                setLcRecords(content);
                setPagination(prev => ({ ...prev, ...pageInfo }));
            } else {
                setLcRecords([]);
                toast.error(response?.data?.message || "Failed to fetch records");
            }
        } catch (error) {
            console.error("Error fetching records:", error);
            toast.error("Failed to fetch records. Please try again.");
            setLcRecords([]);
        } finally {
            setTableLoading(false);
        }
    }, [searchMode, pagination.size, searchText]);

    // Initial Load & Search Debounce
    useEffect(() => {
        if (!searchMode) return;

        clearTimeout(debounceTimeoutRef.current);

        if (searchText.trim() === "") {
            fetchRecords(0, "");
        } else {
            debounceTimeoutRef.current = setTimeout(() => {
                fetchRecords(0, searchText);
            }, 600);
        }

        return () => clearTimeout(debounceTimeoutRef.current);
    }, [searchText, searchMode, fetchRecords]);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            fetchRecords(newPage, searchText);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();

        // Additional validation
        if (!formData.dateOfBirth) {
            toast.error("Please select a date of birth");
            return;
        }
        if (!formData.dateOfAdmission) {
            toast.error("Please select admission date");
            return;
        }
        if (!formData.dateOfLeaving) {
            toast.error("Please select leaving date");
            return;
        }

        setSaveLoading(true);
        try {
            const response = await api.post('/leavingcertificate/createLC', formData, { withCredentials: true });
            if (response.data.success) {
                toast.success("Certificate saved successfully!");
                // Complete form reset
                setFormData(initialFormState);
            } else {
                toast.error(response?.data?.message || "Error saving certificate data");
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.response?.data?.message || 'Error saving certificate data');
        } finally {
            setSaveLoading(false);
        }
    };

    const deleteLcRecord = async (id) => {
        if (!window.confirm("Are you sure you want to delete this record? This action cannot be undone.")) return;

        setActionLoading(prev => ({ ...prev, [id]: 'delete' }));
        try {
            const response = await api.delete(`/leavingcertificate/deleteLC/${id}`, { withCredentials: true });
            if (response.data.success) {
                toast.success("Record deleted successfully");
                
                // Check if we need to go to previous page
                if (lcRecords.length === 1 && pagination.page > 0) {
                    fetchRecords(pagination.page - 1, searchText);
                } else {
                    fetchRecords(pagination.page, searchText);
                }
            } else {
                toast.error(response?.data?.message || "Error deleting record");
            }
        } catch (error) {
            console.error("Error deleting record:", error);
            toast.error(error.response?.data?.message || "Error deleting record");
        } finally {
            setActionLoading(prev => { 
                const newState = { ...prev }; 
                delete newState[id]; 
                return newState; 
            });
        }
    };

    const downloadLcRecord = async (id, name) => {
        setActionLoading(prev => ({ ...prev, [id]: 'download' }));
        try {
            toast.info("Preparing download...");
            const response = await api.get(`/leavingcertificate/downloadLC/${id}`, {
                withCredentials: true,
                responseType: 'blob',
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `LC_${name?.replace(/\s+/g, '_') || 'Certificate'}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Download completed!");
        } catch (error) {
            console.error("Error downloading file:", error);
            toast.error(error.response?.data?.message || "Error downloading file");
        } finally {
            setActionLoading(prev => { 
                const newState = { ...prev }; 
                delete newState[id]; 
                return newState; 
            });
        }
    };

    const handleInputChange = (e, date) => {
        if (date !== undefined) {
            setFormData(prev => ({ ...prev, [e]: date }));
            if (e === "dateOfBirth") {
                const words = parseDate(date);
                setFormData(prev => ({ ...prev, dateOfBirthWords: words || '' }));
            }
            return;
        }
        const { name, type, value, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    // --- RENDER: SEARCH MODE ---
    if (searchMode) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-6 poppins transition-all duration-300">
                <div className="max-w-7xl mx-auto mt-4 md:mt-8 bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">

                    {/* Header */}
                    <div className="p-4 md:p-8 border-b border-gray-100 bg-white">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Leaving Certificate</h1>
                                <p className="text-gray-500 text-sm mt-1">Manage and search student records</p>
                            </div>
                            <Button
                                className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-5 rounded-lg shadow-lg flex items-center gap-2 w-full md:w-auto justify-center"
                                onClick={() => {
                                    setSearchMode(false);
                                    setSearchText("");
                                }}
                            >
                                <ArrowLeft size={18} /> Back to Create
                            </Button>
                        </div>

                        {/* Search Input */}
                        <div className="mt-6 md:mt-8 relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={searchText}
                                onChange={(e) => {
                                    setSearchText(e.target.value);
                                    setPagination(prev => ({ ...prev, page: 0 }));
                                }}
                                className="block w-full pl-12 pr-4 py-3 md:py-4 bg-gray-50 border-gray-200 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-base md:text-lg shadow-sm"
                                placeholder="Search by Student Name, ID, or Aadhar..."
                            />
                            {searchText && (
                                <button
                                    onClick={() => {
                                        setSearchText('');
                                        setPagination(prev => ({ ...prev, page: 0 }));
                                    }}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label="Clear search"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Search Stats */}
                        {!tableLoading && lcRecords.length > 0 && (
                            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-100 gap-2">
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Found <span className="font-bold text-blue-600">{pagination.totalElements}</span> record(s)
                                </span>
                                {searchText && (
                                    <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium border border-blue-200">
                                        Searching: "{searchText}"
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Results Table / List */}
                    <div className="bg-white min-h-[400px]">
                        {tableLoading ? (
                            <>
                                <SkeletonRow />
                                <SkeletonRow />
                                <SkeletonRow />
                            </>
                        ) : lcRecords.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 md:py-20 text-center px-4">
                                <div className="bg-gray-50 p-6 rounded-full mb-4">
                                    <ChessKing className="h-12 w-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Records Found</h3>
                                <p className="text-gray-500 mt-2 max-w-md">
                                    {searchText 
                                        ? `No results found for "${searchText}". Try adjusting your search terms.`
                                        : "No leaving certificates available. Create your first record to get started."
                                    }
                                </p>
                                {searchText && (
                                    <Button 
                                        onClick={() => {
                                            setSearchText('');
                                            setPagination(prev => ({ ...prev, page: 0 }));
                                        }}
                                        variant="outline"
                                        className="mt-4"
                                    >
                                        Clear Search
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {lcRecords.map((lc) => (
                                    <div key={lc.id} className="group flex flex-col md:flex-row justify-between p-4 md:p-6 items-start md:items-center hover:bg-blue-50/30 transition-colors duration-200 gap-4">
                                        <div className="flex-1 min-w-0 w-full md:pr-4">
                                            <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                                                <h2 className="text-base md:text-lg font-bold text-gray-900 truncate">
                                                    {lc.studentName || "Unknown Name"}
                                                </h2>
                                                {getStudentTypeBadge(lc.studentType)}
                                                {lc.isDuplicate && (
                                                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded border border-red-200 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" />
                                                        Duplicate
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500 flex flex-wrap gap-x-4 md:gap-x-6 gap-y-1">
                                                <span className="flex items-center gap-1">
                                                    <span className="font-semibold text-gray-700">Std:</span> {lc.standard || 'N/A'}
                                                </span>
                                                {lc.uniqueIDAdhar && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="font-semibold text-gray-700">UID:</span> 
                                                        <span className="font-mono text-xs">{lc.uniqueIDAdhar}</span>
                                                    </span>
                                                )}
                                                {lc.grNo && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="font-semibold text-gray-700">GR:</span> {lc.grNo}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={actionLoading[lc.id] === 'download'}
                                                className="flex-1 md:flex-none border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                                                onClick={() => downloadLcRecord(lc.id, lc.studentName)}
                                            >
                                                {actionLoading[lc.id] === 'download' ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Download className="w-4 h-4 md:mr-2" />
                                                        <span className="hidden md:inline">Download</span>
                                                    </>
                                                )}
                                            </Button>

                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                className="flex-1 md:flex-none border-gray-200 text-gray-700 hover:bg-gray-50"
                                            >
                                                <Edit className="w-4 h-4 md:mr-2" />
                                                <span className="hidden md:inline">Edit</span>
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={actionLoading[lc.id] === 'delete'}
                                                className="flex-1 md:flex-none bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shadow-none"
                                                onClick={() => deleteLcRecord(lc.id)}
                                            >
                                                {actionLoading[lc.id] === 'delete' ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {!tableLoading && lcRecords.length > 0 && pagination.totalPages > 1 && (
                        <div className="bg-gray-50 p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span className="text-sm text-gray-500 text-center sm:text-left">
                                Showing <span className="font-semibold">{pagination.page * pagination.size + 1}</span> to{' '}
                                <span className="font-semibold">
                                    {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)}
                                </span>{' '}
                                of <span className="font-semibold">{pagination.totalElements}</span> results
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 0}
                                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" /> 
                                    <span className="hidden sm:inline">Previous</span>
                                    <span className="sm:hidden">Prev</span>
                                </Button>
                                
                                {/* Page Numbers */}
                                <div className="hidden md:flex items-center gap-1">
                                    {[...Array(pagination.totalPages)].map((_, index) => {
                                        if (
                                            index === 0 ||
                                            index === pagination.totalPages - 1 ||
                                            (index >= pagination.page - 1 && index <= pagination.page + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => handlePageChange(index)}
                                                    className={`px-3 py-1 rounded-lg font-medium transition-all text-sm ${
                                                        pagination.page === index
                                                            ? 'bg-blue-600 text-white shadow-md'
                                                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                                    }`}
                                                >
                                                    {index + 1}
                                                </button>
                                            );
                                        } else if (
                                            index === pagination.page - 2 ||
                                            index === pagination.page + 2
                                        ) {
                                            return (
                                                <span key={index} className="px-2 text-gray-400">
                                                    ...
                                                </span>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>

                                {/* Mobile: Simple page indicator */}
                                <div className="md:hidden flex items-center px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700">
                                    {pagination.page + 1} / {pagination.totalPages}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages - 1}
                                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="hidden sm:inline">Next</span>
                                    <span className="sm:hidden">Next</span>
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- RENDER: CREATE MODE ---
    const isRegularStudent = formData.studentType === 'FOR REGULAR STUDENT';

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            <div className='max-w-7xl m-auto mt-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10'>
                <div>
                    <h1 className='text-2xl md:text-3xl font-semibold text-gray-800'>Leaving Certificate</h1>
                    <p className="text-sm text-gray-600 mt-1">Create new student certificate</p>
                </div>
                <Button
                    className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all hover:scale-105 flex items-center gap-2 w-full md:w-auto justify-center'
                    onClick={() => { 
                        setSearchMode(true); 
                        fetchRecords(0, ""); 
                    }}
                >
                    <Search className="w-4 h-4" /> Search Records
                </Button>
            </div>

            <div className="max-w-4xl mx-auto bg-white border-2 border-black shadow-2xl">
                {/* HEADER */}
                <div className="border-b-2 border-black p-4 relative min-h-[140px]">
                    {/* LOGO */}
                    <div className="absolute left-4 top-4">
                        <img
                            src={CollegeLogo}
                            alt="College Logo"
                            className="w-20 h-20 md:w-24 md:h-24 object-contain"
                        />
                    </div>

                    {/* TEXT CONTENT */}
                    <div className="text-center w-full px-8 md:px-10">
                        <p className="text-[10px] md:text-xs font-semibold mb-1 uppercase">Pragnya Educational Trust's</p>
                        <h2 className="text-lg md:text-[22px] font-black mb-1 uppercase text-gray-900 leading-tight">
                            Pragnya Junior College of Arts, Commerce & Science
                        </h2>
                        <p className="text-[10px] md:text-xs font-medium mb-1">(Approved by Maharashtra State Board)</p>

                        <div className="text-[10px] md:text-xs text-gray-800 space-y-0.5 mt-2 font-medium">
                            <p>Address: Sr. No. 28/1/1, Village Handewadi/Saunde, off Katraj - Saswad by pass Road</p>
                            <p>Tal:- Haveli, Po:- Urli-Devachi, Pin. No. - 412308</p>
                            <p>Phone No. : +91 – 9970886904</p>
                            <p>Website: www.pragnyacollege.com / Email: Pragnja@gmail.com</p>
                        </div>

                        <div className="flex justify-between items-center mt-2 md:mt-3 text-[10px] md:text-xs font-bold border-t border-black pt-1 px-2 md:px-4">
                            <span>INDEX NO.:- J11.15.092</span>
                            <span>DISE NO: - 27250500703</span>
                        </div>
                    </div>
                </div>

                {/* Form Title & Type Selection */}
                <div className="border-b-2 border-black p-4 bg-gray-50">
                    <h3 className="text-lg md:text-xl font-bold mb-4 text-center underline decoration-2 underline-offset-4">LEAVING CERTIFICATE</h3>
                    <div className='flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6'>
                        <select
                            name="studentType"
                            value={formData.studentType}
                            onChange={handleInputChange}
                            className="w-full sm:w-auto border border-black px-4 py-2 text-sm font-semibold bg-white focus:ring-2 focus:ring-blue-500 rounded"
                        >
                            <option value="FOR REGULAR STUDENT">FOR REGULAR STUDENT</option>
                            <option value="FOR PRIVATE STUDENT">FOR PRIVATE STUDENT</option>
                        </select>

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                name="isDuplicate"
                                checked={formData.isDuplicate}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="font-semibold text-sm">Is Duplicate</span>
                        </label>
                    </div>
                </div>

                {/* Main Form Fields */}
                <form onSubmit={handleCreateSubmit}>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <tbody>
                                {/* GR NO */}
                                {isRegularStudent && (
                                    <tr className="border-b border-black">
                                        <td className="border-r border-black p-2 md:p-3 bg-gray-100 w-1/3 font-semibold text-xs md:text-sm">GR No.</td>
                                        <td className="p-2 md:p-3">
                                            <input 
                                                required 
                                                type="text" 
                                                name="grNo" 
                                                value={formData.grNo} 
                                                onChange={handleInputChange}
                                                className="w-full border-b border-gray-300 focus:outline-none focus:border-black p-1 transition-colors text-sm md:text-base"
                                                placeholder="Enter GR Number"
                                            />
                                        </td>
                                    </tr>
                                )}

                                {/* Regular Student Fields */}
                                {isRegularStudent && (
                                    <>
                                        <tr className="border-b border-black">
                                            <td className="border-r border-black p-2 md:p-3 bg-gray-100 font-semibold text-xs md:text-sm">Student PEN</td>
                                            <td className="p-2 md:p-3">
                                                <input 
                                                    required 
                                                    type="text" 
                                                    name="studentPEN" 
                                                    value={formData.studentPEN} 
                                                    onChange={handleInputChange} 
                                                    className="w-full border-b border-gray-300 focus:outline-none focus:border-black uppercase p-1 text-sm md:text-base"
                                                    placeholder="Enter PEN"
                                                />
                                            </td>
                                        </tr>
                                        <tr className="border-b border-black">
                                            <td className="border-r border-black p-2 md:p-3 bg-gray-100 font-semibold text-xs md:text-sm">Student Apaar ID</td>
                                            <td className="p-2 md:p-3">
                                                <input 
                                                    required 
                                                    type="text" 
                                                    name="studentApaarID" 
                                                    value={formData.studentApaarID} 
                                                    onChange={handleInputChange} 
                                                    className="w-full border-b border-gray-300 focus:outline-none focus:border-black uppercase p-1 text-sm md:text-base"
                                                    placeholder="Enter Apaar ID"
                                                />
                                            </td>
                                        </tr>
                                        <tr className="border-b border-black">
                                            <td className="border-r border-black p-2 md:p-3 bg-gray-100 font-semibold text-xs md:text-sm">Student ID</td>
                                            <td className="p-2 md:p-3">
                                                <input 
                                                    required 
                                                    type="text" 
                                                    name="studentID" 
                                                    value={formData.studentID} 
                                                    onChange={handleInputChange} 
                                                    className="w-full border-b border-gray-300 focus:outline-none focus:border-black uppercase p-1 text-sm md:text-base"
                                                    placeholder="Enter Student ID"
                                                />
                                            </td>
                                        </tr>
                                    </>
                                )}

                                {/* Standard Fields */}
                                <tr className="border-b border-black">
                                    <td className="border-r border-black p-2 md:p-3 bg-gray-100 font-semibold text-xs md:text-sm">Unique ID (Aadhar)</td>
                                    <td className="p-2 md:p-3">
                                        <input 
                                            required 
                                            type="text" 
                                            name="uniqueIDAdhar" 
                                            value={formData.uniqueIDAdhar} 
                                            onChange={handleInputChange} 
                                            maxLength="12"
                                            pattern="\d{12}"
                                            className="w-full border-b border-gray-300 focus:outline-none focus:border-black uppercase p-1 text-sm md:text-base"
                                            placeholder="Enter 12-digit Aadhaar"
                                        />
                                    </td>
                                </tr>
                                <tr className="border-b border-black">
                                    <td className="border-r border-black p-2 md:p-3 bg-gray-100 text-xs md:text-sm">1) Name of Student</td>
                                    <td className="p-2 md:p-3">
                                        <input 
                                            required 
                                            type="text" 
                                            name="studentName" 
                                            value={formData.studentName} 
                                            onChange={handleInputChange} 
                                            className="w-full border-b border-gray-300 focus:outline-none focus:border-black uppercase p-1 text-sm md:text-base"
                                            placeholder="Enter full name"
                                        />
                                    </td>
                                </tr>
                                <tr className="border-b border-black">
                                    <td className="border-r border-black p-2 md:p-3 bg-gray-100 text-xs md:text-sm">2) Mother's Name</td>
                                    <td className="p-2 md:p-3">
                                        <input 
                                            required 
                                            type="text" 
                                            name="motherName" 
                                            value={formData.motherName} 
                                            onChange={handleInputChange} 
                                            className="w-full border-b border-gray-300 focus:outline-none focus:border-black uppercase p-1 text-sm md:text-base"
                                            placeholder="Enter mother's name"
                                        />
                                    </td>
                                </tr>

                                {/* Nationality & Mother Tongue */}
                                <tr className="border-b border-black">
                                    <td className="border-r border-black p-2 md:p-3 bg-gray-100 text-xs md:text-sm">3) Nationality</td>
                                    <td className="p-2 md:p-3">
                                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                            <input 
                                                required 
                                                type="text" 
                                                name="nationality" 
                                                value={formData.nationality} 
                                                onChange={handleInputChange} 
                                                className="flex-1 border-b border-gray-300 focus:outline-none focus:border-black uppercase p-1 text-sm md:text-base"
                                                placeholder="Nationality"
                                            />
                                            <span className="text-xs md:text-sm font-semibold whitespace-nowrap self-start sm:self-end sm:mb-1">4) Mother Tongue:</span>
                                            <input 
                                                required 
                                                type="text" 
                                                name="motherTongue" 
                                                value={formData.motherTongue} 
                                                onChange={handleInputChange} 
                                                className="flex-1 border-b border-gray-300 focus:outline-none focus:border-black uppercase p-1 text-sm md:text-base"
                                                placeholder="Mother tongue"
                                            />
                                        </div>
                                    </td>
                                </tr>

                                {/* Religion & Caste */}
                                <tr className="border-b border-black">
                                    <td className="border-r border-black p-2 md:p-3 bg-gray-100 text-xs md:text-sm">5) Religion</td>
                                    <td className="p-2 md:p-3">
                                        <input 
                                            required 
                                            type="text" 
                                            name="religion" 
                                            value={formData.religion} 
                                            onChange={handleInputChange} 
                                            className="w-full border-b border-gray-300 focus:outline-none focus:border-black uppercase p-1 text-sm md:text-base"
                                            placeholder="Enter religion"
                                        />
                                    </td>
                                </tr>
                                <tr className="border-b border-black">
                                    <td className="border-r border-black p-2 md:p-3 bg-gray-100 text-xs md:text-sm">6) Caste & Sub-Caste</td>
                                    <td className="p-2 md:p-3">
                                        <input 
                                            required 
                                            type="text" 
                                            name="caste" 
                                            value={formData.caste} 
                                            onChange={handleInputChange} 
                                            className="w-full border-b border-gray-300 focus:outline-none focus:border-black uppercase p-1 text-sm md:text-base"
                                            placeholder="Enter caste"
                                        />
                                    </td>
                                </tr>

                                {/* Birth Info */}
                                <tr className="border-b border-black">
                                    <td className="border-r border-black p-2 md:p-3 bg-gray-100 text-xs md:text-sm">7) Place of Birth</td>
                                    <td className="p-2 md:p-3">
                                        <input 
                                            required 
                                            type="text" 
                                            name="placeOfBirth" 
                                            value={formData.placeOfBirth} 
                                            onChange={handleInputChange} 
                                            className="w-full border-b border-gray-300 focus:outline-none focus:border-black uppercase p-1 text-sm md:text-base"
                                            placeholder="Village/City, Taluka, State"
                                        />
                                    </td>
                                </tr>
                                <tr className="border-b border-black">
                                    <td className="border-r border-black p-2 md:p-3 bg-gray-100 text-xs md:text-sm">8) Date of Birth</td>
                                    <td className="p-2 md:p-3">
                                        <DatePicker 
                                            selected={formData.dateOfBirth ? parseISO(formData.dateOfBirth) : null} 
                                            onChange={(date) => handleInputChange("dateOfBirth", formatDate(date))} 
                                            dateFormat="dd/MM/yyyy" 
                                            showYearDropdown 
                                            showMonthDropdown 
                                            dropdownMode="select" 
                                            maxDate={new Date()}
                                            className="w-full border-b border-gray-300 focus:outline-none focus:border-black uppercase p-1 text-sm md:text-base" 
                                            placeholderText="Select Date" 
                                            required
                                        />
                                    </td>
                                </tr>
                                <tr className="border-b border-black">
                                    <td className="border-r border-black p-2 md:p-3 bg-gray-100 text-xs md:text-sm">9) Date of Birth (Words)</td>
                                    <td className="p-2 md:p-3">
                                        <input 
                                            required 
                                            readOnly 
                                            type="text" 
                                            name="dateOfBirthWords" 
                                            value={formData.dateOfBirthWords} 
                                            className="w-full border-b border-gray-300 bg-blue-50 uppercase p-1 text-gray-700 text-sm md:text-base" 
                                            placeholder="Auto-generated"
                                        />
                                    </td>
                                </tr>

                                {/* Academic Info */}
                                <tr className="border-b border-black">
                                    <td className="border-r border-black p-2 md:p-3 bg-gray-100 text-xs md:text-sm">10) Last School</td>
                                    <td className="p-2 md:p-3">
                                        <input 
                                            required 
                                            type="text" 
                                            name="lastSchool" 
                                            value={formData.lastSchool} 
                                            onChange={handleInputChange} 
                                            className="w-full border-b border-gray-300 focus:outline-none focus:border-black uppercase p-1 text-sm md:text-base"
                                            placeholder="Enter last school name"
                                        />
                                    </td>
                                </tr>
                                <tr className="border-b border-black">
                                    <td className="border-r border-black p-2 md:p-3 bg-gray-100 text-xs md:text-sm">11) Date of Admission</td>
                                    <td className="p-2 md:p-3">
                                        <DatePicker 
                                            selected={formData.dateOfAdmission ? parseISO(formData.dateOfAdmission) : null} 
                                            onChange={(date) => handleInputChange("dateOfAdmission", formatDate(date))} 
                                            dateFormat="dd/MM/yyyy" 
                                            showYearDropdown 
                                            showMonthDropdown 
                                            maxDate={new Date()}
                                            className="w-full border-b border-gray-300 focus:outline-none focus:border-black uppercase p-1 text-sm md:text-base" 
                                            placeholderText="Select Date" 
                                            required
                                        />
                                    </td>
                                </tr>
                                <tr className="border-b border-black">
                                    <td className="border-r border-black p-2 md:p-3 bg-gray-100 text-xs md:text-sm">12) Progress & Conduct</td>
                                    <td className="p-2 md:p-3">
                                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                            <select 
                                                name="progress" 
                                                value={formData.progress} 
                                                onChange={handleInputChange} 
                                                required
                                                className="flex-1 border-b border-gray-300 focus:outline-none focus:border-black p-1 text-sm md:text-base"
                                            >
                                                <option value="">Select Progress</option>
                                                <option value="EXCELLENT">Excellent</option>
                                                <option value="GOOD">Good</option>
                                                <option value="AVERAGE">Average</option>
                                            </select>
                                            <span className="text-xs md:text-sm font-semibold whitespace-nowrap self-start sm:self-end sm:mb-1">13) Conduct:</span>
                                            <select 
                                                name="conduct" 
                                                value={formData.conduct} 
                                                onChange={handleInputChange} 
                                                required
                                                className="flex-1 border-b border-gray-300 focus:outline-none focus:border-black p-1 text-sm md:text-base"
                                            >
                                                <option value="">Select Conduct</option>
                                                <option value="EXCELLENT">Excellent</option>
                                                <option value="GOOD">Good</option>
                                                <option value="AVERAGE">Average</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                                <tr className="border-b border-black">
                                    <td className="border-r border-black p-2 md:p-3 bg-gray-100 text-xs md:text-sm">14) Date of Leaving</td>
                                    <td className="p-2 md:p-3">
                                        <DatePicker 
                                            selected={formData.dateOfLeaving ? parseISO(formData.dateOfLeaving) : null} 
                                            onChange={(date) => handleInputChange("dateOfLeaving", formatDate(date))} 
                                            dateFormat="dd/MM/yyyy" 
                                            showYearDropdown 
                                            showMonthDropdown 
                                            maxDate={new Date()}
                                            className="w-full border-b border-gray-300 focus:outline-none focus:border-black uppercase p-1 text-sm md:text-base" 
                                            placeholderText="Select Date" 
                                            required
                                        />
                                    </td>
                                </tr>
                                <tr className="border-b border-black">
                                    <td className="border-r border-black p-2 md:p-3 bg-gray-100 text-xs md:text-sm">15) Standard</td>
                                    <td className="p-2 md:p-3">
                                        <select 
                                            name="standard" 
                                            value={formData.standard} 
                                            onChange={handleInputChange} 
                                            required
                                            className="w-full border-b border-gray-300 focus:outline-none focus:border-black p-1 text-sm md:text-base"
                                        >
                                            <option value="">Select Standard</option>
                                            <option value="11TH ARTS">11TH ARTS</option>
                                            <option value="11TH COMMERCE">11TH COMMERCE</option>
                                            <option value="11TH SCIENCE">11TH SCIENCE</option>
                                            <option value="12TH ARTS">12TH ARTS</option>
                                            <option value="12TH COMMERCE">12TH COMMERCE</option>
                                            <option value="12TH SCIENCE">12TH SCIENCE</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr className="border-b border-black">
                                    <td className="border-r border-black p-2 md:p-3 bg-gray-100 text-xs md:text-sm">16) Reason</td>
                                    <td className="p-2 md:p-3">
                                        <input 
                                            required 
                                            type="text" 
                                            name="reasonForLeaving" 
                                            value={formData.reasonForLeaving} 
                                            onChange={handleInputChange} 
                                            className="w-full border-b border-gray-300 focus:outline-none focus:border-black uppercase p-1 text-sm md:text-base"
                                            placeholder="Reason for leaving"
                                        />
                                    </td>
                                </tr>
                                <tr className="border-b border-black">
                                    <td className="border-r border-black p-2 md:p-3 bg-gray-100 text-xs md:text-sm">17) Remarks</td>
                                    <td className="p-2 md:p-3">
                                        <input 
                                            required 
                                            type="text" 
                                            name="remarks" 
                                            value={formData.remarks} 
                                            onChange={handleInputChange} 
                                            className="w-full border-b border-gray-300 focus:outline-none focus:border-black uppercase p-1 text-sm md:text-base"
                                            placeholder="Enter remarks"
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 md:p-6 text-center bg-gray-100 border-t-2 border-black">
                        <Button
                            disabled={saveLoading}
                            type="submit"
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 md:px-10 py-3 md:py-4 font-bold tracking-wide rounded-lg shadow-lg w-full md:w-auto transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
                        >
                            {saveLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin w-5 h-5" />
                                    SAVING...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                    </svg>
                                    SAVE CERTIFICATE
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LeavingCertificate;