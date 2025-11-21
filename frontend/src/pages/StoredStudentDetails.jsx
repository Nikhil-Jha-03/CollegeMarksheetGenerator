import React, { useEffect, useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Trash, Loader2 } from 'lucide-react';
import Templete from './Templete';

const StoredStudentDetails = () => {

    const [studentsData, setStudentsData] = useState([]);
    const [pageSize, setPageSize] = useState(5);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const timeoutRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [preview, setPreview] = useState(false)
    const [previewData, setPreviewData] = useState({})
    const [searchBy, setSearchBy] = useState('')
    const [search, setSearch] = useState('')

    // ------------ FETCH DATA -------------
    const fetchStudentDetails = async () => {
        setLoading(true);

        try {
            const response = await api.get(
                `/student/getsavedstudent?page=${page}&size=${pageSize}`
            );

            if (response?.data?.success) {
                setStudentsData(response.data.data.content);
                setTotalPages(response.data.data.totalPages);
            }

        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const toggleView = () => {
        setPreview(false)
        setPreviewData({})
    }

    const handlePreview = (grNo) => {
        console.log(grNo)
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

    // ------------ DEBOUNCE FETCH -------------
    useEffect(() => {
        setLoading(true);
        clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            fetchStudentDetails();
        }, 600);

        return () => clearTimeout(timeoutRef.current);
    }, [page, pageSize]);


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
            <div className="overflow-x-auto min-h-screen poppins">

                {/* TOP BAR */}
                <div className='w-5xl m-auto mt-10 flex justify-between items-center'>
                    <h1 className='text-xl font-semibold'>Student Details</h1>

                    <div className='flex items-center gap-4'>

                        {/* Rows Input */}



                        <label
                            htmlFor="rows"
                            className="inline-flex items-center gap-2 text-sm font-medium text-gray-700"
                        >
                            <span>Rows</span>

                            <input
                                id="rows"
                                name="rows"
                                type="number"
                                min={1}
                                max={500}
                                value={pageSize}
                                onChange={(e) => {
                                    let v = Number(e.target.value);
                                    if (Number.isNaN(v)) return;
                                    if (v < 1) v = 1;
                                    if (v > 500) v = 500;

                                    setPageSize(v);
                                    setPage(0); // reset to first page
                                }}
                                className="w-14 text-sm rounded-md border px-2 py-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </label>

                        {/* Pagination Buttons */}
                        <div className='flex gap-3'>
                            <Button
                                variant="outline"
                                disabled={page <= 0}
                                onClick={() => setPage(page - 1)}
                            >
                                Previous
                            </Button>

                            <Button
                                variant="outline"
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage(page + 1)}
                            >
                                Next
                            </Button>
                        </div>

                        {/* Page Info */}
                        <div className='flex gap-2 items-center text-sm'>
                            <span>Page</span>
                            <span className="font-semibold">{page + 1}</span>
                            <span>of</span>
                            <span className="font-semibold">{totalPages}</span>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                {loading ? (
                    // ------------------ BIG CENTERED LOADER ------------------
                    <div className="w-5xl m-auto flex justify-center mt-32 text-zinc-500">
                        <Loader2 className="h-10 w-10 animate-spin" />
                    </div>

                ) : studentsData.length > 0 ? (

                    <div className='w-5xl m-auto table-fade mt-14'>
                        <div className='flex gap-2'>
                            <label htmlFor="searchBy">

                                <select className='text-sm rounded-md border px-2 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring' name="grNo" id="searchBy">
                                    {Object.keys(studentsData[0] || {}).map((key) => (
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
                                    id="search"
                                    name="search"
                                    type="text"
                                    placeholder='Seacrch'
                                    className="w-sm text-sm rounded-md border px-2 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </label>



                        </div>
                        <table className="border-collapse border border-gray-300 mt-5 ">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border px-4 py-2">GR No</th>
                                    <th className="border px-4 py-2">Name</th>
                                    <th className="border px-4 py-2">Mother's Name</th>
                                    <th className="border px-4 py-2">Class</th>
                                    <th className="border px-4 py-2">Percentage</th>
                                    <th className="border px-4 py-2">Result</th>
                                    <th className="border px-4 py-2">Preview</th>
                                    <th className="border px-4 py-2">Print</th>
                                    <th className="border px-4 py-2">Delete</th>
                                </tr>
                            </thead>

                            <tbody>
                                {studentsData.map((student, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="border px-4 py-2">{student.grNo}</td>
                                        <td className="border px-4 py-2">{student.name}</td>
                                        <td className="border px-4 py-2">{student.motherName}</td>
                                        <td className="border px-4 py-2">{student.studentClass}</td>
                                        <td className="border px-4 py-2">{student.percentage}%</td>

                                        <td className="border px-4 py-2">
                                            <span
                                                className={`px-2 py-1 rounded ${student.result === 'Pass'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {student.result}
                                            </span>
                                        </td>

                                        <td className="border px-4 py-2">
                                            <span onClick={() => handlePreview(student.grNo | null)}>
                                                <Button className="cursor-pointer" variant="secondary">Preview</Button>
                                            </span>
                                        </td>

                                        <td className="border px-4 py-2">
                                            <span>

                                                <Button className="cursor-pointer" >Print</Button>
                                            </span>
                                        </td>

                                        <td className="border px-4 py-2">
                                            <span>
                                                <Button className="cursor-pointer" variant="destructive">
                                                    <Trash className="h-4 w-4 mr-1" /> Delete
                                                </Button>
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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


// implement search functionality and add ANNUAL RESULTS 2024 - 2025 this
// And change the pagable type for no warning