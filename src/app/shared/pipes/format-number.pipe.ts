import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'formatNumber',
    standalone: true,
})
export class FormatNumberPipe implements PipeTransform {
    transform(value: number | null | undefined, precision: number = 4): string {
        if (value === null || value === undefined) return '';
        return value.toFixed(precision);
    }
}
