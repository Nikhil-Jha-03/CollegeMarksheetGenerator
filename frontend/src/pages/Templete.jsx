import React from 'react'
import CollegeLogo from "../assets/CollegeLogo.png"

const Templete = ({student}) => {
console.log(student)
    return (
        <div className="w-[794px] min-h-[1123px] p-10 mx-auto bg-white text-gray-800 text-[14px] poppins table-fade">


            <div className='flex justify-center'>
                <img src={CollegeLogo} alt="" />

            </div>

            {/* College Header */}
            <div className="text-center mb-6">
                <h1 className="text-xl font-bold">Pragnya Educational Trust's</h1>
                <h2 className="text-lg font-semibold">
                    Pragnya Junior College of Arts, Commerce & Science
                </h2>
                <p className="text-sm">(Approved by Maharashtra State Board)</p>
                <p className="text-sm font-medium">Handewadi, Hadapsar, Pune</p>

                <h2 className="mt-4 text-lg font-bold underline">
                    ANNUAL RESULTS {student.annualResult || 2024 - 2025 }
                </h2>
            </div>

            {/* Student Info */}


            <table className="w-full mt-8 border border-gray-400 text-sm">
                <tbody>

                    <tr>
                        <td className="border p-2">Class</td>
                        <td className="border p-2 text-center">{student.studentClass}</td>
                        <td className="border p-2 text-center">Roll No</td>
                        <td className="border p-2 text-center">{student.rollNo}</td>
                    </tr>
                    <tr>
                        <td className="border p-2">Student Name</td>
                        <td className="border p-2 text-center">{student.name}</td>
                        <td className="border p-2 text-center">Mother's Name</td>
                        <td className="border p-2 text-center">{student.motherName}</td>
                    </tr>
                    <tr>
                        <td className="border p-2">Date of Birth:</td>
                        <td className="border p-2 text-center">{student.dob}</td>
                        <td className="border p-2 text-center">G.R. No.:</td>
                        <td className="border p-2 text-center">{student.grNo}</td>
                    </tr>


                </tbody>
            </table>


            {/* Subjects Table */}
            <table className="w-full mt-8 m-auto border border-gray-400 text-sm">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">Subjects</th>
                        <th className="border p-2">Total Marks</th>
                        <th className="border p-2">Obtained Marks</th>
                    </tr>
                </thead>

                <tbody>
                    {student.subjects.map((sub, i) => (
                        <tr key={i}>
                            <td className="border p-2">{sub.subjectName}</td>
                            <td className="border p-2 text-center">{sub.total}</td>
                            <td className="border p-2 text-center">{sub.obtained}</td>
                        </tr>
                    ))}
                </tbody>
            </table>



            {/* Summary */}
            <div className="mt-6 text-sm">
                <p><strong>Total Marks:</strong> {student.totalMarks}</p>
                <p><strong>Obtained Marks:</strong> {student.obtainedMarks}</p>
                <p><strong>Percentage:</strong> {student.percentage}%</p>
                <p><strong>Result:</strong> {student.result}</p>
                <p><strong>Remark:</strong> {student.remark}</p>
            </div>

            {/* Footer */}
            <div className="mt-6 text-sm">
                <p><strong>Date of Issue:</strong> {student.dateOfIssue}</p>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 text-center mt-10 text-sm">
                <p>Class Teacher</p>
                <p>Vice-Principal</p>
                <p>Principal</p>
            </div>
        </div>
    );
}

export default Templete