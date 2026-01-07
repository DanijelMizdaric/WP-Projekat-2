import { Injectable } from '@angular/core';
import * as html2pdf from 'html2pdf.js';
import * as html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  
  async generatePDF(elementId: string, filename: string = 'document.pdf') {
    try {
      const element = document.getElementById(elementId);
      if (!element) throw new Error('Element not found');
      
      const opt = {
        margin: 1,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      await html2pdf().from(element).set(opt).save();
      
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  }
  
  async captureAsImage(elementId: string): Promise<string> {
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Element not found');
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });
    
    return canvas.toDataURL('image/png');
  }
}