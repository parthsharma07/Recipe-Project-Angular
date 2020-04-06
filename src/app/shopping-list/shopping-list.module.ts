import { NgModule } from '@angular/core';
import { ShoppingListComponent } from './shopping-list.component';
import { ShoppingEditComponent } from './shopping-edit/shopping-edit.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from '../shared/shared.module';

@NgModule({
    declarations: [
        ShoppingListComponent,
        ShoppingEditComponent
    ],
    imports: [
        FormsModule,
        BrowserModule,
        RouterModule.forChild([
            { path: 'shopping-list', component: ShoppingListComponent },
        ]),
        SharedModule
    ]
})
export class ShoppingListModule{}