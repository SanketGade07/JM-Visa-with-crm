/**
 * Maps country names to their corresponding PDF checklist files
 * Handles variations in country names and PDF filename formats
 */

// Country name variations mapping
const countryVariations = {
  'Algeria': ['Algeria', 'Algerian'],
  'Austria': ['Austria', 'Austrian'],
  'Bulgaria': ['Bulgaria', 'Bulgarian'],
  'Canada': ['Canada', 'Canadian'],
  'China': ['China', 'Chinese'],
  'Croatia': ['Croatia', 'Croatian'],
  'Cyprus': ['Cyprus', 'Cypriot'],
  'Czech Republic': ['Czech Republic', 'Czech'],
  'Denmark': ['Denmark', 'Danish'],
  'Dominican Republic': ['Dominican Republic', 'Dominican'],
  'Egypt': ['Egypt', 'Egyptian'],
  'France': ['France', 'French'],
  'Germany': ['Germany', 'German'],
  'Greece': ['Greece', 'Greek'],
  'South Africa': ['South Africa', 'South African'],
};

/**
 * Get all PDF files for a given country name
 * @param {string} countryName - The country name from CountryData
 * @returns {string[]} Array of PDF file paths relative to /public/pdf
 */
export function getCountryPDFs(countryName) {
  if (!countryName) return [];

  // List of all available PDF files (excluding visa-sample folder)
  const allPDFs = [
    'Algeria Tourist checklist.pdf',
    'Algerian Business Visa Checklist.pdf',
    'Austria Business Visa.pdf',
    'Austria Long Term study Visa.pdf',
    'Austria Long Term Visit Visa.pdf',
    'Austria study, research, internship Visa.pdf',
    'Austria Tourist Visa.pdf',
    'Azerbaijan Tourist Visa.pdf',
    'Bulgarian Business checklist.pdf',
    'Bulgarian Tourist checklist.pdf',
    'Canada Study Visa.pdf',
    'Canada Tourist Visa.pdf',
    'Canada Visit Visa.pdf',
    'Chinese Business Visa.pdf',
    'Chinese Tourist Visa.pdf',
    'Chinese Visit Visa.pdf',
    'Croatia Tourist checklist.pdf',
    'Cyprus Business Visa.pdf',
    'Cyprus Tourist Visa.pdf',
    'Czech Republic Business Visa.pdf',
    'Czech Republic Tourist Visa.pdf',
    'Denmark Business Visa.pdf',
    'Denmark Tourist Visa.pdf',
    'Dominican Republic Business Visa.pdf',
    'Dominican Republic Tourist  Visa.pdf',
    'Egypt Business document checklist.pdf',
    'Egypt Tourist checklist.pdf',
    'Egypt Tourist document checklist.pdf',
    'France Business Visa.pdf',
    'France Tourist Visa.pdf',
    'Germany Business Visa.pdf',
    'Germany Tourist Visa.pdf',
    'Greece Business Visa.pdf',
    'Greece Tourist Visa.pdf',
    'Short Term Visa.pdf',
    'South Africa Tourist checklist.pdf',
  ];

  // Normalize country name for matching
  const normalizedCountry = countryName.trim();
  
  // Get variations for the country
  const variations = countryVariations[normalizedCountry] || [normalizedCountry];
  
  // Find matching PDFs
  const matchingPDFs = allPDFs.filter(pdfName => {
    const pdfLower = pdfName.toLowerCase();
    const normalizedLower = normalizedCountry.toLowerCase();
    
    // Check if any variation matches
    return variations.some(variation => {
      const variationLower = variation.toLowerCase();
      // Match if PDF name contains the country name or variation
      // Also check if country name itself matches (for cases not in variations map)
      return pdfLower.includes(variationLower) || pdfLower.includes(normalizedLower);
    });
  });

  // Return full paths relative to /public/pdf
  return matchingPDFs.map(pdf => `/pdf/${pdf}`);
}

/**
 * Get country name variations for matching
 * @param {string} countryName - The country name
 * @returns {string[]} Array of name variations
 */
export function getCountryVariations(countryName) {
  return countryVariations[countryName] || [countryName];
}

