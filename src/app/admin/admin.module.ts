import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { SubNavComponent } from './subnav.component';
import { LayoutComponent } from './layout.component';
import { OverviewComponent } from './overview.component';
import { FormsModule } from '@angular/forms';
import { EmployeesComponent } from './employees/employees.component'; // Employees 
@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AdminRoutingModule,
        FormsModule
    ],
    declarations: [
        SubNavComponent,
        LayoutComponent,
        OverviewComponent,
        EmployeesComponent // Employees
    ]
})
export class AdminModule { }