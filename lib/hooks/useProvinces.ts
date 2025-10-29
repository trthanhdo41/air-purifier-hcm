import { useState, useEffect, useCallback } from 'react';

interface Province {
  code: string;
  name: string;
}

interface District {
  code: string;
  name: string;
}

interface Ward {
  code: string;
  name: string;
}

interface UseProvincesReturn {
  provinces: Province[];
  districts: District[];
  wards: Ward[];
  loading: boolean;
  loadingProvinces: boolean;
  error: string | null;
  fetchDistricts: (provinceCode: string) => void;
  fetchWards: (districtCode: string) => void;
  resetDistricts: () => void;
  resetWards: () => void;
}

export function useProvinces(): UseProvincesReturn {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      setError(null);
      try {
        const response = await fetch('https://provinces.open-api.vn/api/p/');
        if (!response.ok) throw new Error('Failed to fetch provinces');
        
        const data = await response.json();
        const hanoi = data.find((p: any) => p.name === 'Thành phố Hà Nội');
        const hcm = data.find((p: any) => p.name === 'Thành phố Hồ Chí Minh');
        const danang = data.find((p: any) => p.name === 'Thành phố Đà Nẵng');
        
        const filteredProvinces = [
          { code: hcm?.code != null ? String(hcm.code) : '', name: 'Thành phố Hồ Chí Minh' },
          { code: hanoi?.code != null ? String(hanoi.code) : '', name: 'Thành phố Hà Nội' },
          { code: danang?.code != null ? String(danang.code) : '', name: 'Thành phố Đà Nẵng' },
        ].filter(p => p.code);
        
        setProvinces(filteredProvinces);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoadingProvinces(false);
      }
    };

    fetchProvinces();
  }, []);

  const fetchDistricts = useCallback(async (provinceCode: string) => {
    if (!provinceCode) {
      setDistricts([]);
      setWards([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}/?depth=2`);
      if (!response.ok) throw new Error('Failed to fetch districts');
      
      const data = await response.json();
      const districtsData = data.districts?.map((d: any) => ({
        code: String(d.code),
        name: d.name,
      })) || [];
      
      setDistricts(districtsData);
      setWards([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setDistricts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWards = useCallback(async (districtCode: string) => {
    if (!districtCode) {
      setWards([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}/?depth=2`);
      if (!response.ok) throw new Error('Failed to fetch wards');
      
      const data = await response.json();
      const wardsData = data.wards?.map((w: any) => ({
        code: String(w.code),
        name: w.name,
      })) || [];
      
      setWards(wardsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setWards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetDistricts = useCallback(() => {
    setDistricts([]);
    setWards([]);
  }, []);

  const resetWards = useCallback(() => {
    setWards([]);
  }, []);

  return {
    provinces,
    districts,
    wards,
    loading,
    loadingProvinces,
    error,
    fetchDistricts,
    fetchWards,
    resetDistricts,
    resetWards,
  };
}

