import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCountryPDFs } from '../../../utils/pdfMapper';

export async function GET(request) {
  try {
    // Get country name from query parameters
    const { searchParams } = new URL(request.url);
    const countryName = searchParams.get('country');

    if (!countryName) {
      return NextResponse.json(
        { error: 'Country parameter is required' },
        { status: 400 }
      );
    }

    // Get PDF files for the country
    const pdfPaths = getCountryPDFs(countryName);

    if (pdfPaths.length === 0) {
      return NextResponse.json(
        { error: `No PDF checklists found for ${countryName}` },
        { status: 404 }
      );
    }

    // Verify PDF files exist and return their URLs
    const pdfDir = path.join(process.cwd(), 'public', 'pdf');
    const availablePDFs = [];
    
    for (const pdfPath of pdfPaths) {
      // Extract filename from path (e.g., /pdf/Austria Business Visa.pdf -> Austria Business Visa.pdf)
      const filename = pdfPath.replace('/pdf/', '');
      const filePath = path.join(pdfDir, filename);

      // Check if file exists
      if (fs.existsSync(filePath)) {
        // Return the public URL path for the PDF
        availablePDFs.push({
          filename: filename,
          url: pdfPath, // This is already /pdf/filename.pdf
        });
      }
    }

    if (availablePDFs.length === 0) {
      return NextResponse.json(
        { error: `No PDF files found for ${countryName}` },
        { status: 404 }
      );
    }

    // Return list of PDF URLs
    return NextResponse.json({
      success: true,
      pdfs: availablePDFs,
      count: availablePDFs.length
    });
  } catch (error) {
    console.error('Error getting PDF list:', error);
    return NextResponse.json(
      { error: 'Failed to get PDF files. Please try again later.' },
      { status: 500 }
    );
  }
}

