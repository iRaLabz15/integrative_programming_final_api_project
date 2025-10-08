// employees.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Employee {
  employeeCode: string;
  email: string;
  position: string;
  department: string;
  hireDate: string; // YYYY-MM-DD
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {
  employees: Employee[] = [];
  selectedEmployee: Employee | null = null;
  newEmployee: Employee = this.createEmptyEmployee();
  showAddForm = false;
  isLoading = false;

  // set to your backend
  apiUrl = 'http://localhost:4000/employees';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchEmployees();
  }

  private createEmptyEmployee(): Employee {
    return {
      employeeCode: '',
      email: '',
      position: '',
      department: '',
      hireDate: '',
      status: 'Active'
    };
  }

  /** Ensure we consistently handle different shapes from backend */
  private normalizeEmployee(raw: any): Employee {
    const employeeCode = raw.employeeCode ?? raw.id ?? raw.code ?? '';
    const email = raw.email ?? raw.accountEmail ?? '';
    // Normalize status: accept 'Active' | 'Inactive' | boolean | 1/0
    let status: 'Active' | 'Inactive' = 'Active';
    if (raw.status === 'Inactive' || raw.status === 'inactive' || raw.status === false || raw.status === 0 || raw.status === '0') {
      status = 'Inactive';
    }
    // Normalize hireDate to YYYY-MM-DD (so date input/select works)
    let hireDate = '';
    if (raw.hireDate) {
      // raw may be ISO timestamp
      hireDate = String(raw.hireDate).split('T')[0];
    }
    return {
      employeeCode,
      email,
      position: raw.position ?? '',
      department: raw.department ?? '',
      hireDate,
      status
    };
  }

  fetchEmployees(): void {
    this.isLoading = true;
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.employees = (data || []).map(d => this.normalizeEmployee(d));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching employees', err);
        this.isLoading = false;
      }
    });
  }

  openAddForm(): void {
    this.showAddForm = true;
    this.newEmployee = this.createEmptyEmployee();
  }

  saveNewEmployee(): void {
    if (!this.newEmployee.email || !this.newEmployee.position || !this.newEmployee.department) {
      alert('Please fill required fields.');
      return;
    }

    // default hireDate if missing
    if (!this.newEmployee.hireDate) {
      this.newEmployee.hireDate = new Date().toISOString().split('T')[0];
    }

    // POST to backend
    this.http.post<any>(this.apiUrl, this.newEmployee).subscribe({
      next: (created) => {
        // normalize server response (or fallback to form data)
        const added = this.normalizeEmployee(created ?? this.newEmployee);
        this.employees.push(added);
        this.showAddForm = false;
        this.newEmployee = this.createEmptyEmployee();
      },
      error: (err) => {
        console.error('Error creating employee', err);
        alert('Failed to add employee. See console.');
      }
    });
  }

  editEmployee(emp: Employee): void {
    // clone to avoid editing the table row directly
    this.selectedEmployee = { ...emp };
  }

  saveEmployee(updatedEmployee: Employee | null): void {
    if (!updatedEmployee) return;

    // ensure hireDate is a YYYY-MM-DD string for backend/date input
    if (updatedEmployee.hireDate) {
      updatedEmployee.hireDate = String(updatedEmployee.hireDate).split('T')[0];
    }

    const idToken = encodeURIComponent(updatedEmployee.employeeCode || updatedEmployee.email);

    this.http.put<any>(`${this.apiUrl}/${idToken}`, updatedEmployee).subscribe({
      next: (res) => {
        // backend might return updated object or no body (204). Use fallback.
        const updated = this.normalizeEmployee(res ?? updatedEmployee);

        const idx = this.employees.findIndex(e => e.employeeCode === (updated.employeeCode || updatedEmployee.employeeCode));
        if (idx > -1) {
          this.employees[idx] = updated;
        } else {
          // If not found, push (defensive)
          this.employees.push(updated);
        }
        this.selectedEmployee = null;
      },
      error: (err) => {
        console.error('Error updating employee', err);
        alert('Failed to update employee. See console for details.');
      }
    });
  }

  deleteEmployee(code: string): void {
    if (!confirm('Delete this employee?')) return;
    const id = encodeURIComponent(code);
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.employees = this.employees.filter(e => e.employeeCode !== code);
      },
      error: (err) => {
        console.error('Error deleting employee', err);
        alert('Failed to delete employee.');
      }
    });
  }

  transferDepartment(code: string, newDept: string): void {
    const emp = this.employees.find(e => e.employeeCode === code);
    if (!emp) return;
    const updated = { ...emp, department: newDept };
    this.saveEmployee(updated);
  }

  requestAction(code: string): void {
    alert(`Request action for ${code}`);
  }

  workflowAction(code: string): void {
    alert(`Workflow action for ${code}`);
  }
}
