import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';

export default function useGetData(url, initData) {
  const { data, isLoading } = useQuery({
    queryKey: [`${url}`],
    queryFn: () => axiosInstance.get(url).then(res => res),
  });

  if (!data || data.status !== 200) {
    return { data: initData, isLoading };
  }

  return { data: data.data, isLoading };
}
