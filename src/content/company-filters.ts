export function filterCompanies<T extends Record<string, any>>(companies: T[], category = '전체', query = ''): T[] {
  const normalize = (value: string) => value.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, '');
  const term = normalize(query.trim());
  return companies.filter(company => {
    const industry = ['식품', '제조', '기타'].includes(company.industry) ? company.industry : '기타';
    const text = [company.name, company.representative, company.tagline, company.description, ...(company.tags || [])].filter(Boolean).join(' ');
    return (category === '전체' || industry === category) && (!term || normalize(text).includes(term));
  });
}
