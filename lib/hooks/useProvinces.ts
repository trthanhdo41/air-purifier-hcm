import { useState, useEffect, useCallback, useRef } from 'react';

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
  const controllersRef = useRef<{ provinces?: AbortController; districts?: AbortController; wards?: AbortController }>({});

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoadingProvinces(true);
      setError(null);
      
      // Try cache first
      try {
        const cached = localStorage.getItem('vn_provinces_cache');
        if (cached) {
          const cachedData = JSON.parse(cached);
          if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
            setProvinces(cachedData);
            setLoadingProvinces(false);
            // Load fresh data in background
          }
        }
      } catch {}
      
      try {
        if (controllersRef.current.provinces) controllersRef.current.provinces.abort();
        controllersRef.current.provinces = new AbortController();
        const timeout = setTimeout(() => controllersRef.current.provinces?.abort(), 10000);
        
        // Chỉ dùng 1 API duy nhất
        const res = await fetch('https://vn-public-apis.fpo.vn/provinces/getAll?limit=-1', {
          signal: controllersRef.current.provinces.signal
        });
        
        clearTimeout(timeout);
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        
        const data = await res.json();
        const list = Array.isArray(data?.data?.data) ? data.data.data : Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        
        const priorityProvinces = [
          'Thành phố Hồ Chí Minh',
          'Thành phố Hà Nội',
          'Thành phố Đà Nẵng',
          'Thành phố Cần Thơ',
          'Thành phố Hải Phòng',
        ];
        
        const allProvinces = list.map((p: any) => ({
          code: String(p.code ?? p?.ProvinceCode ?? p?.id ?? ''),
          name: p.name ?? p?.ProvinceName ?? ''
        })).filter((x: any) => x.name && x.code);
        
        allProvinces.sort((a: Province, b: Province) => {
          const aPriority = priorityProvinces.indexOf(a.name);
          const bPriority = priorityProvinces.indexOf(b.name);
          if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
          if (aPriority !== -1) return -1;
          if (bPriority !== -1) return 1;
          return a.name.localeCompare(b.name, 'vi');
        });
        
        if (mounted) {
          setProvinces(allProvinces);
          try {
            localStorage.setItem('vn_provinces_cache', JSON.stringify(allProvinces));
          } catch {}
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Không thể tải danh sách tỉnh thành');
          try {
            const cached = localStorage.getItem('vn_provinces_cache');
            if (cached) {
              const cachedData = JSON.parse(cached);
              if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
                setProvinces(cachedData);
              }
            }
          } catch {}
        }
      } finally {
        if (mounted) {
          setLoadingProvinces(false);
        }
      }
    };
    run();
    return () => {
      mounted = false;
      controllersRef.current.provinces?.abort();
    };
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
      if (controllersRef.current.districts) controllersRef.current.districts.abort();
      controllersRef.current.districts = new AbortController();
      const timeout = setTimeout(() => controllersRef.current.districts?.abort(), 10000);
      
      // Chỉ dùng 1 API duy nhất
      const res = await fetch(
        `https://vn-public-apis.fpo.vn/districts/getByProvince?provinceCode=${provinceCode}&limit=-1`,
        { signal: controllersRef.current.districts.signal }
      );
      
      clearTimeout(timeout);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      const list = Array.isArray(data?.data?.data) 
        ? data.data.data 
        : Array.isArray(data?.data) 
          ? data.data 
          : Array.isArray(data) 
            ? data 
            : [];
      
      const districtsData = list.map((d: any) => ({
        code: String(d.code ?? d?.DistrictCode ?? ''),
        name: d.name ?? d?.DistrictName ?? '',
      })).filter((d: any) => d.code && d.name);
      
      setDistricts(districtsData);
      setWards([]);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách quận/huyện');
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
      if (controllersRef.current.wards) controllersRef.current.wards.abort();
      controllersRef.current.wards = new AbortController();
      const timeout = setTimeout(() => controllersRef.current.wards?.abort(), 10000);
      
      // Chỉ dùng 1 API duy nhất
      const res = await fetch(
        `https://vn-public-apis.fpo.vn/wards/getByDistrict?districtCode=${districtCode}&limit=-1`,
        { signal: controllersRef.current.wards.signal }
      );
      
      clearTimeout(timeout);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      const list = Array.isArray(data?.data?.data) 
        ? data.data.data 
        : Array.isArray(data?.data) 
          ? data.data 
          : Array.isArray(data) 
            ? data 
            : [];
      
      const wardsData = list.map((w: any) => ({
        code: String(w.code ?? w?.WardCode ?? ''),
        name: w.name ?? w?.WardName ?? '',
      })).filter((w: any) => w.code && w.name);
      
      setWards(wardsData);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách phường/xã');
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

