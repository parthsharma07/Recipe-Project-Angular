import { NgModule } from '@angular/core';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { AlertComponent } from './alert/alert.component';
import { PlaceholderDirective } from './placeholder/placeholder.directive';
import { DropdownDirective } from './dropdown.directive';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [
        LoadingSpinnerComponent,
        AlertComponent,
        PlaceholderDirective,
        DropdownDirective
    ],
    imports: [
        CommonModule
    ],
    exports: [
        LoadingSpinnerComponent,
        AlertComponent,
        PlaceholderDirective,
        DropdownDirective,
        CommonModule
    ],
    entryComponents: [
        AlertComponent
      ]
})
export class SharedModule{}