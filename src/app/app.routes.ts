import { Routes } from '@angular/router';
import { PlaygroundComponent } from './features/playground/playground.component';
import { DocumentationComponent } from './features/documentation/documentation.component';

export const routes: Routes = [
    { path: '', component: DocumentationComponent },
    { path: 'playground', component: PlaygroundComponent },
    { path: '**', redirectTo: '' }
];
