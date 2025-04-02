import axios from 'axios';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export interface ReportOptions {
  type: 'users' | 'communities' | 'activities';
  format: 'pdf' | 'csv' | 'excel';
  dateRange?: {
    start: Date;
    end: Date;
  };
}

class ReportService {
  private baseUrl = '/api/reports';

  async generateReport(options: ReportOptions): Promise<Blob> {
    try {
      // Fetch data from API
      const response = await axios.get(`${this.baseUrl}/generate`, {
        params: {
          type: options.type,
          format: 'json', // Always get JSON from API
          startDate: options.dateRange?.start?.toISOString(),
          endDate: options.dateRange?.end?.toISOString()
        }
      });

      const { data, metadata } = response.data;

      // Convert to requested format
      switch (options.format) {
        case 'pdf':
          return this.generatePDFReport(data, metadata);
        case 'csv':
          return this.generateCSVReport(data);
        case 'excel':
          return this.generateExcelReport(data);
        default:
          throw new Error('Unsupported format');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  private generatePDFReport(data: any, metadata: any): Blob {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(16);
    doc.text(`${metadata.type.charAt(0).toUpperCase() + metadata.type.slice(1)} Report`, 14, 15);
    
    // Add metadata
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date(metadata.generatedAt).toLocaleString()}`, 14, 25);
    doc.text(`Period: ${new Date(metadata.dateRange.start).toLocaleDateString()} - ${new Date(metadata.dateRange.end).toLocaleDateString()}`, 14, 30);

    // Add summary section
    doc.setFontSize(12);
    doc.text('Summary', 14, 40);
    const summaryEntries = Object.entries(data.summary);
    summaryEntries.forEach(([key, value], index) => {
      const yPos = 50 + (index * 7);
      doc.text(`${this.formatKey(key)}: ${this.formatValue(value)}`, 20, yPos);
    });

    // Add details table
    if (data.details && data.details.length > 0) {
      const startY = 50 + (summaryEntries.length * 7) + 10;
      
      const headers = Object.keys(data.details[0]).map(this.formatKey);
      const rows = data.details.map((item: any) => 
        Object.values(item).map(this.formatValue)
      );

      (doc as any).autoTable({
        head: [headers],
        body: rows,
        startY,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] }
      });
    }

    return new Blob([doc.output('blob')], { type: 'application/pdf' });
  }

  private generateCSVReport(data: any): Blob {
    const rows = [
      // Header row
      Object.keys(data.details[0]).map(this.formatKey),
      // Data rows
      ...data.details.map((item: any) => 
        Object.values(item).map(this.formatValue)
      )
    ];

    const csv = rows.map(row => row.join(',')).join('\n');
    return new Blob([csv], { type: 'text/csv;charset=utf-8' });
  }

  private generateExcelReport(data: any): Blob {
    // For simplicity, we're using CSV format that Excel can open
    // In a production environment, you might want to use a proper Excel library
    return this.generateCSVReport(data);
  }

  private formatKey(key: string): string {
    return key
      .split(/(?=[A-Z])/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private formatValue(value: any): string {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return String(value);
  }

  downloadReport(blob: Blob, type: string, format: string): void {
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `${type}-report-${timestamp}.${format}`;
    saveAs(blob, fileName);
  }
}

export default new ReportService();