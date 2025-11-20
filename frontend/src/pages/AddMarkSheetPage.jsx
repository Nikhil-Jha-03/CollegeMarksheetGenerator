import { useCallback, useEffect, useState } from 'react';
import Templete from './Templete';
import api from '../api/axios';
import { X } from 'lucide-react';
import {toast} from 'react-toastify'

const AddMarkSheetPage = () => {
  const [showTemplate, setShowTemplate] = useState(false);
  const [classDisplay, setClassDisplay] = useState([]);
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState({
    name: "",
    motherName: "",
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

  const toggleView = () => setShowTemplate(prev => !prev);

  const handleInputChange = (field, value) => {
    if (field === "studentClass") {
      const id = parseInt(value)
      const classText = classDisplay.find(item => item.classId == id)?.className
      setStudent(prev => ({ ...prev, [field]: classText }));
      return
    }
    setStudent(prev => ({ ...prev, [field]: value }));
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get("defaultData/getclassesinfo");
      if (response?.data) {
        setClassDisplay(response.data);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async (classId) => {
    try {
      setLoading(true);
      const response = await api.get(`defaultData/getsubjectinfo/${classId}`);
      if (response?.data && response.data.length > 0) {

        console.log(response.data)
        const subjects = response.data.map(item => ({
          subjectName: item.subjectName,
          total: item.marksType === "MARKS" ? 100 : "GRADE",
          obtained: "",
          type: item.marksType,
          subjectCode: item.subjectCode
        }));
        setStudent(prev => ({ ...prev, subjects }));
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      console.log(student.subjects)
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
        subjects: []
      }));
      fetchSubjects(classId);
    }
  };

  const addSubject = () => {
    setStudent(prev => ({
      ...prev,
      subjects: [
        ...prev.subjects,
        { subjectName: "", total: 100, obtained: "", type: "MARKS", subjectCode:0 }
      ]
    }));
  };

  const handleSubjectChange = (index, field, value) => {
    setStudent(prev => {
      const newSubjects = [...prev.subjects];
      newSubjects[index][field] = value
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
        total += Number(subject.total) || 0;
        const obtainedMarks = Number(subject.obtained) || 0;
        obtained += obtainedMarks;

        if (obtainedMarks > 0 && obtainedMarks < 35) {
          isFail = true;
        }
      }
    });

    const percentage = total > 0 ? (obtained / total) * 100 : 0;
    const result = isFail ? "Fail" : "Pass";
    const remark = isFail ? "Failed" : "Pass and Promoted to Standard XII";

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
    console.log(student)
    if (!student.name || !student.motherName || !student.studentClass || !student.dob || !student.grNo) {
      alert("Please fill all required fields");
      return;
    }
    if (student.subjects.length === 0) {
      alert("Please add at least one subject");
      return;
    }

    const response = await api.post("/student/savestudent",student)
    if (!response?.data?.success) {
      return toast.error(response?.data?.message)
    }else{
      toast.success(response?.data?.message)
    }

    console.log("response",response.data)
    toggleView();
  };

  useEffect(() => {
    calculateMarks();
  }, [calculateMarks]);

  useEffect(() => {
    fetchClasses();
  }, []);

  // console.log(student.subjects)

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
            <h1 className="text-2xl font-bold">Student Result Card Entry Form</h1>
          </div>
        </div>

        {/* Student Information */}
        <div className="bg-white shadow-sm mb-6 p-8">
          <h2 className="text-xl font-bold mb-6 pb-3 border-b-2 border-gray-800">Student Information</h2>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-semibold mb-2">Student Name *</label>
                <input
                  type="text"
                  value={student.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full border-2 border-gray-300 px-4 py-3 text-base focus:border-gray-800 focus:outline-none"
                  placeholder="Enter student name"
                />
              </div>

              <div>
                <label className="block text-base font-semibold mb-2">Mother's Name *</label>
                <input
                  type="text"
                  value={student.motherName}
                  onChange={(e) => handleInputChange('motherName', e.target.value)}
                  className="w-full border-2 border-gray-300 px-4 py-3 text-base focus:border-gray-800 focus:outline-none"
                  placeholder="Enter mother's name"
                />
              </div>

              <div>
                <label className="block text-base font-semibold mb-2">Class *</label>
                <select
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
                <label className="block text-base font-semibold mb-2">Date of Birth *</label>
                <input
                  type="date"
                  value={student.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  className="w-full border-2 border-gray-300 px-4 py-3 text-base focus:border-gray-800 focus:outline-none"
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
              className="px-6 py-3 bg-gray-800 text-white font-medium text-base hover:bg-gray-700"
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
                    <div className='flex items-center gap-2'>
                      <input
                        type="text"
                        placeholder={sub?.total === "GRADE" ? "Enter Grade" : "MARKS"}
                        value={sub?.obtained}
                        onChange={(e) => handleSubjectChange(index, 'obtained', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                      />
                      <span
                        onClick={(e) => removeSubject(index)}
                        className='cursor-pointer'><X /></span>
                    </div>

                    <div>
                    </div>
                  </div>
                ))}
              </div>
          ) : (
            <div className="border-2 border-gray-300 p-12 text-center bg-gray-50">
              <p className="text-lg text-gray-600 mb-4">No subjects added yet</p>
              <button
                onClick={addSubject}
                className="px-6 py-3 bg-gray-800 text-white font-medium text-base"
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
              onClick={handleSave}
              className="flex-1 px-8 py-4 bg-gray-800 text-white font-bold text-lg hover:bg-gray-700"
            >
              Save & Preview
            </button>
            <button
              onClick={toggleView}
              className="px-8 py-4 border-2 border-gray-800 text-gray-800 font-bold text-lg hover:bg-gray-100"
            >
              Preview
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddMarkSheetPage;