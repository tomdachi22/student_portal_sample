// REPLACE WITH YOUR ACTUAL GOOGLE SHEET INFO
const SPREADSHEET_ID = '1rxoUGHDizLa0hqvmYwhAKnh2Zo5tcDVtWi7UwX_d4WY'; // The ID from your Google Sheet URL
const API_KEY = 'AIzaSyA6j8OCOi_Jbp-AHlEbG44_Yp91HlK4kBI';       // The API Key you generated in Google Cloud Console
const SHEET_NAME = 'Sheet1';               // The name of your sheet (e.g., 'Sheet1')
const RANGE = 'A:I';                       // The range of columns you want to fetch (e.g., 'A:G' for columns A through G)

async function checkGrades() {
    const studentIdInput = document.getElementById('studentIdInput');
    const gradeDisplay = document.getElementById('gradeDisplay');
    const studentId = studentIdInput.value.trim();

    if (studentId === "") {
        gradeDisplay.innerHTML = '<p class="error">Please enter a Student ID.</p>';
        return;
    }

    gradeDisplay.innerHTML = '<p>Loading grades...</p>'; // Loading message

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!${RANGE}?key=${API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const rows = data.values; // rows will be an array of arrays

        if (!rows || rows.length < 2) { // Check if there's at least a header row and one data row
            gradeDisplay.innerHTML = '<p class="error">No student data found.</p>';
            return;
        }

        const headers = rows[0]; // First row contains headers
        const studentRows = rows.slice(1); // Rest of the rows are student data

        // Find the student by ID
        // Assuming Student ID is in the first column (index 0)
        const foundStudentRow = studentRows.find(row => row[1] === studentId);

        if (foundStudentRow) {
            // Map the row data to an object for easier access
            const student = {
                id: foundStudentRow[0],
                name: foundStudentRow[1],
                section: foundStudentRow[2],
                grades: []
            };

            // Parse grades (assuming Subject 1 is column D, Grade 1 is E, Subject 2 is F, Grade 2 is G, etc.)
            // Adjust indices based on your sheet structure
            for (let i = 3; i < headers.length; i += 2) { // Start from Subject 1 column, increment by 2
                const subject = foundStudentRow[i];
                const grade = foundStudentRow[i + 1];
                if (subject && grade) { // Only add if both subject and grade exist
                    student.grades.push({ subject: subject, grade: grade });
                }
            }

            let gradesHtml = `
                <p><strong>${student.name} ${student.section}</strong></p>
                <table>
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th>Grade</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            if (student.grades.length > 0) {
                student.grades.forEach(item => {
                    gradesHtml += `
                        <tr>
                            <td>${item.subject}</td>
                            <td>${item.grade}</td>
                        </tr>
                    `;
                });
            } else {
                gradesHtml += `
                    <tr>
                        <td colspan="2">No grades found for this student.</td>
                    </tr>
                `;
            }

            gradesHtml += `
                    </tbody>
                </table>
            `;
            gradeDisplay.innerHTML = gradesHtml;

        } else {
            gradeDisplay.innerHTML = '<p class="error">Student ID not found. Please try again.</p>';
        }

    } catch (error) {
        console.error("Error fetching data from Google Sheet:", error);
        gradeDisplay.innerHTML = '<p class="error">An error occurred while fetching grades. Please check the console for details.</p>';
    }
}