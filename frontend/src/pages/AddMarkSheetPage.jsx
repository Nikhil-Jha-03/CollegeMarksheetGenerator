import { useCallback, useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Templete from './Templete';
import api from '../api/axios';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { parseISO } from "date-fns";


function debounce(fn, delay = 1000) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const MarkSheetFormPage = ({ mode = 'add' }) => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [showTemplate, setShowTemplate] = useState(false);
  const [classDisplay, setClassDisplay] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === 'edit');
  const [student, setStudent] = useState({
    name: "",
    motherName: "",
    annualResult: "",
    studentClass: "",
    dob: "",
    grNo: "",
    subjects: [],
    totalMarks: 0,
    obtainedMarks: 0,
    percentage: 0,
    result: "",
    remark: "",
    dateOfIssue: new Date().toISOString().split('T')[0]
  });
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = mode === 'edit';

  const toggleView = () => setShowTemplate(prev => !prev);

  const handleInputChange = (field, value) => {
    if (field === "studentClass") {
      const id = parseInt(value);
      const classText = classDisplay.find(item => item.classId == id)?.className;
      setStudent(prev => ({ ...prev, [field]: classText }));
      return;
    }

    setStudent(prev => ({
      ...prev,
      [field]: typeof value === "string" ? value.toUpperCase() : value
    }));
  };

  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/defaultData/getclassesinfo", { withCredentials: true });
      if (response?.data) {
        setClassDisplay(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentData = async () => {
    if (!studentId) return;

    try {

      const numericGrno = parseInt(studentId);

      if (isNaN(numericGrno) || numericGrno <= 0) {
        toast.error("Unable to delete");
        return;
      }

      setInitialLoading(true);
      const response = await api.get(`/student/getStudent/${numericGrno}`, { withCredentials: true });
      if (response?.status === 200) {
        const studentData = response.data;
        // Format the date if it exists

        console.log(studentData)

        if (studentData.dob) {
          studentData.dob = new Date(studentData.dob).toISOString().split('T')[0];
        }
        if (studentData.dateOfIssue) {
          studentData.dateOfIssue = new Date(studentData.dateOfIssue).toISOString().split('T')[0];
        }
        setStudent(studentData);
      } else {
        toast.error("Failed to fetch student data");
        navigate('/allstudent'); // Redirect if student not found
      }
    } catch (error) {
      toast.error("Failed to load student data");
      // navigate('/allstudent');
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchSubjects = async (classId) => {
    try {
      const response = await api.get(
        `/defaultData/getsubjectinfo/${classId}`,
        { withCredentials: true }
      );

      if (response?.data && response.data.length > 0) {
        const subjects = response.data.map(item => {
          const isComputerScience =
            item.subjectName?.trim().toUpperCase() === "COMPUTER SCIENCE";

          return {
            subjectName: item.subjectName,
            total:
              item.marksType === "MARKS"
                ? isComputerScience
                  ? 200
                  : 100
                : "GRADE",
            obtained: "",
            type: item.marksType,
            subjectCode: item.subjectCode
          };
        });

        setStudent(prev => ({ ...prev, subjects }));
      }
    } catch (error) {
      console.error(error); // 🔥 add this for debugging
      toast.error("Failed to fetch subjects");
    } finally {
      setLoading(false);
    }
  };


  const handleClassChange = (value) => {
  const classId = parseInt(value);
  const selectedClass = classDisplay.find(item => item.classId === classId);

  if (selectedClass) {
    setStudent(prev => ({
      ...prev,
      studentClass: selectedClass.className,
      subjects: [] // Clear old subjects
    }));

    // Fetch new subjects for the selected class
    fetchSubjects(classId);
  }
};

  const addSubject = () => {
    setStudent(prev => ({
      ...prev,
      subjects: [
        ...prev.subjects,
        { subjectName: "", total: 100, obtained: "", type: "MARKS", subjectCode: 0 }
      ]
    }));
  };

  const handleSubjectChange = (index, field, value) => {
    setStudent(prev => {
      const newSubjects = [...prev.subjects];
      newSubjects[index][field] = value;
      return { ...prev, subjects: newSubjects };
    });
  };

  const removeSubject = (index) => {
    setStudent(prev => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index)
    }));
  };

  const calculateMarks = useCallback(() => {
    let total = 0;
    let obtained = 0;
    let isFail = false;

    student.subjects.forEach(subject => {
      if (subject.type?.toLowerCase() !== "grade") {
        const subjectTotal = Number(subject.total) || 0;
        const obtainedMarks = Number(subject.obtained) || 0;

        total += subjectTotal;
        obtained += obtainedMarks;

        const isComputerScience =
          subject.subjectName?.trim().toUpperCase() === "COMPUTER SCIENCE";

        // ✅ Subject-wise passing criteria
        if (
          obtainedMarks > 0 &&
          (
            (isComputerScience && obtainedMarks < 70) ||
            (!isComputerScience && obtainedMarks < 35)
          )
        ) {
          isFail = true;
        }
      }
    });

    const percentage = total > 0 ? (obtained / total) * 100 : 0;

    const result = isFail ? "Fail" : "Pass";
    const remark = isFail
      ? "Failed and not eligible for promotion to Standard XII"
      : "Passed and Promoted to Standard XII";

    setStudent(prev => ({
      ...prev,
      totalMarks: total,
      obtainedMarks: obtained,
      percentage: percentage.toFixed(2),
      result,
      remark
    }));
  }, [student.subjects]);

  const handleSave = async () => {
    if (isSaving) return;
    if (!student.name || !student.motherName || !student.studentClass || !student.dob || !student.grNo || !student.annualResult) {
      toast.error("Please fill all required fields");
      return;
    }
    if (student.subjects.length === 0) {
      toast.error("Please add at least one subject");
      return;
    }

    try {

      setIsSaving(true);
      // const numericGrno = parseInt(studentId);

      // if (isNaN(numericGrno) || numericGrno <= 0) {
      //   toast.error("Unable to delete");
      //   return;
      // }

      const endpoint = isEditMode
        ? `/student/updatestudent/${studentId}`
        : "/student/savestudent";

      const method = isEditMode ? 'put' : 'post';

      const response = await api[method](endpoint, student, { withCredentials: true });

      if (!response?.data?.success) {
        toast.error(response?.data?.message || "Failed to save");
        return;
      }

      toast.success(response?.data?.message || `Student ${isEditMode ? 'updated' : 'saved'} successfully`);
      // toggleView();
      setStudent({
        name: "",
        motherName: "",
        annualResult: "",
        studentClass: "",
        dob: "",
        grNo: "",
        subjects: [],
        totalMarks: 0,
        obtainedMarks: 0,
        percentage: 0,
        result: "",
        remark: "",
        dateOfIssue: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const debouncedHandleSave = useMemo(() => debounce(handleSave, 1200), [handleSave]);

  useEffect(() => {
    calculateMarks();
  }, [calculateMarks]);

  useEffect(() => {
    fetchClasses();
    if (isEditMode) {
      fetchStudentData();
    }
  }, []);

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading student data...</p>
        </div>
      </div>
    );
  }

  if (showTemplate) {
    return (
      <div className='w-full bg-gray-50'>
        <div className="min-h-screen w-fit m-auto bg-gray-50 p-6">
          <button
            onClick={toggleView}
            className="mb-4 px-6 py-3 bg-gray-800 text-white text-base font-medium"
          >
            ← Back to Form
          </button>
          <Templete student={student} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 poppins">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="bg-white shadow-sm mb-6">
          <div className="bg-gray-800 text-white px-8 py-5">
            <h1 className="text-2xl font-bold">
              {isEditMode ? 'Edit' : 'Add'} Student Result Card Entry Form
            </h1>
          </div>
        </div>

        {/* Student Information */}
        <div className="bg-white shadow-sm mb-6 p-8">
          <h2 className="text-xl font-bold mb-6 pb-3 border-b-2 border-gray-800">Student Information</h2>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="block text-base font-semibold mb-2">For Annual Result *</label>
                <select
                  value={student.annualResult}
                  onChange={(e) => handleInputChange("annualResult", e.target.value)}
                  className="w-full border-2 border-gray-300 px-4 py-3 text-base focus:border-gray-800 focus:outline-none"
                >
                  <option value="" disabled>Select year range</option>
                  {Array.from({ length: 10 }).map((_, index) => {
                    const start = 2024 + index;
                    const end = start + 1;
                    const label = `${start} - ${end}`;
                    return (
                      <option key={index} value={label}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-base font-semibold mb-2">Student Name *</label>
                <input
                  type="text"
                  value={student.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full border-2 border-gray-300 px-4 py-3 text-base focus:border-gray-800 focus:outline-none uppercase"
                  placeholder="Enter student name"
                />
              </div>

              <div>
                <label className="block text-base font-semibold mb-2">Mother's Name *</label>
                <input
                  type="text"
                  value={student.motherName}
                  onChange={(e) => handleInputChange('motherName', e.target.value)}
                  className="w-full border-2 border-gray-300 px-4 py-3 text-base focus:border-gray-800 focus:outline-none uppercase"
                  placeholder="Enter mother's name"
                />
              </div>

              <div>
                <label className="block text-base font-semibold mb-2">Class *</label>
                <select
                  value={classDisplay.find(c => c.className === student.studentClass)?.classId || ''}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="w-full border-2 border-gray-300 px-4 py-3 text-base focus:border-gray-800 focus:outline-none"
                  disabled={loading}
                >
                  <option value="">Select Class</option>
                  {classDisplay.map((item) => (
                    <option key={item.classId} value={item.classId}>
                      {item.className}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="w-full block text-base font-semibold mb-2">
                  Date of Birth *
                </label>

                <DatePicker
                  selected={student.dob ? parseISO(student.dob) : null}
                  onChange={(date) =>
                    handleInputChange(
                      "dob",
                      date ? formatDate(date) : ""
                    )
                  }
                  dateFormat="dd/MM/yyyy"
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  maxDate={new Date()}
                  placeholderText="Select date"
                  className="w-full border border-gray-300 px-4 py-3"
                />

              </div>


              <div>
                <label className="block text-base font-semibold mb-2">G.R. No. *</label>
                <input
                  type="number"
                  value={student.grNo}
                  onChange={(e) => handleInputChange('grNo', e.target.value)}
                  className="w-full border-2 border-gray-300 px-4 py-3 text-base focus:border-gray-800 focus:outline-none"
                  placeholder="Enter G.R. number"
                />
              </div>

              <div>
                <label className="block text-base font-semibold mb-2">Date of Issue</label>
                <input
                  type="date"
                  value={student.dateOfIssue}
                  onChange={(e) => handleInputChange('dateOfIssue', e.target.value)}
                  className="w-full border-2 border-gray-300 px-4 py-3 text-base focus:border-gray-800 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Subjects Section */}
        <div className="bg-white shadow-sm mb-6 p-8">
          <div className="flex justify-between items-center mb-6 pb-3 border-b-2 border-gray-800">
            <h2 className="text-xl font-bold">Subject Marks</h2>
            <button
              onClick={addSubject}
              className="px-6 py-3 bg-gray-800 text-white font-medium text-base hover:bg-gray-700 cursor-pointer"
            >
              + Add Subject
            </button>
          </div>

          {student.subjects.length > 0 ? (
            <div>
              {student.subjects.map((sub, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 mb-3">
                  <div className='flex items-center'>
                    <h1>{sub.subjectCode}</h1>
                    <input
                      type="text"
                      value={sub?.subjectName}
                      placeholder='Enter Subject Name'
                      onChange={(e) => handleSubjectChange(index, 'subjectName', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 ml-2"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={sub?.total}
                      onChange={(e) => handleSubjectChange(index, 'total', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                    />
                  </div>
                  {/* <div className='flex items-center gap-2'>
                    <input
                      type="text"
                      placeholder={sub?.total === "GRADE" ? "Enter Grade" : "MARKS"}
                      value={sub?.obtained}
                      onChange={(e) => handleSubjectChange(index, 'obtained', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                    />
                    <span
                      onClick={() => removeSubject(index)}
                      className='cursor-pointer'
                    >
                      <X />
                    </span>
                  </div> */}

                  <div className='flex items-center gap-2'>
                    {sub?.total === "GRADE" ? (
                      // Show grade select dropdown
                      <select
                        value={sub?.obtained}
                        onChange={(e) => handleSubjectChange(index, 'obtained', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                      >
                        <option value="">Select Grade</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                        <option value="F">F</option>
                      </select>
                    ) : (
                      // Show marks input
                      <input
                        type="number"
                        placeholder="MARKS"
                        value={sub?.obtained}
                        onChange={(e) => handleSubjectChange(index, 'obtained', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                      />
                    )}

                    <span
                      onClick={() => removeSubject(index)}
                      className='cursor-pointer'
                    >
                      <X />
                    </span>
                  </div>



                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-gray-300 p-12 text-center bg-gray-50">
              <p className="text-lg text-gray-600 mb-4">No subjects added yet</p>
              <button
                onClick={addSubject}
                className="px-6 py-3 bg-gray-800 text-white font-medium text-base cursor-pointer"
              >
                Add Your First Subject
              </button>
            </div>
          )}
        </div>

        {/* Results Summary */}
        {student.subjects.length > 0 && (
          <div className="bg-white shadow-sm mb-6 p-8">
            <h3 className="text-xl font-bold mb-6 pb-3 border-b-2 border-gray-800">Results Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="border-2 border-gray-300 p-4 text-center">
                <p className="text-sm font-semibold text-gray-600 mb-2">Total Marks</p>
                <p className="text-3xl font-bold">{student.totalMarks}</p>
              </div>
              <div className="border-2 border-gray-300 p-4 text-center">
                <p className="text-sm font-semibold text-gray-600 mb-2">Obtained</p>
                <p className="text-3xl font-bold">{student.obtainedMarks}</p>
              </div>
              <div className="border-2 border-gray-300 p-4 text-center">
                <p className="text-sm font-semibold text-gray-600 mb-2">Percentage</p>
                <p className="text-3xl font-bold">{student.percentage}%</p>
              </div>
              <div className="border-2 border-gray-300 p-4 text-center">
                <p className="text-sm font-semibold text-gray-600 mb-2">Result</p>
                <p className="text-3xl font-bold">{student.result}</p>
              </div>
              <div className="border-2 border-gray-300 p-4 text-center col-span-2 md:col-span-1">
                <p className="text-sm font-semibold text-gray-600 mb-2">Remark</p>
                <p className="text-base font-bold">{student.remark}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white shadow-sm p-8">
          <div className="flex gap-4">
            <button
              onClick={debouncedHandleSave}
              disabled={isSaving}
              className={`flex-1 px-8 py-4 font-bold text-lg text-white cursor-pointer
    ${isSaving ? "bg-gray-600 cursor-not-allowed" : "bg-gray-800 hover:bg-gray-700"}`}
            >
              {isSaving ? (
                <div className="flex items-center justify-center gap-3">
                  <span className="loader h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  {isEditMode ? "Updating..." : "Saving..."}
                </div>
              ) : (
                isEditMode ? "Update" : "Save"
              )}
            </button>

            <button
              onClick={toggleView}
              className="px-8 py-4 border-2 border-gray-800 text-gray-800 font-bold text-lg hover:bg-gray-100 cursor-pointer"
            >
              Preview
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MarkSheetFormPage;