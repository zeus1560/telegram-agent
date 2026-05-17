import useSWR from 'swr';
import axiosInstance from '../api/axiosInstance';
import { LocalSave } from '../LocalSave';
import { authApi } from '../api/global';

export default function useUser() {
  authApi.setToken(LocalSave.getToken());
  const { data, isLoading } = useSWR(
    `${import.meta.env.VITE_API_URL}/api/profile`,
    url => axiosInstance.get(url).then(res => res),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  if (!data || data.status !== 200) {
    return { user: null, isLoading };
  }

  return { user: data.data, isLoading };
}
