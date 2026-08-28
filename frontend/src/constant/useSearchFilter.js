import { useState, useMemo } from 'react';

export const useSearchFilter = (dataList = [], searchKeys = ['businessName', 'category', 'location']) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return dataList;

    return dataList.filter((item) => {
      return searchKeys.some((key) => {
        const value = item[key];
        if (Array.isArray(value)) {
          return value.some((v) => v.toLowerCase().includes(query));
        }
        return value?.toLowerCase().includes(query);
      });
    });
  }, [dataList, searchTerm, searchKeys]);

  return { searchTerm, setSearchTerm, filteredData };
};