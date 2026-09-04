import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBookingsApi, createBookingApi, updateBookingStatusApi } from '../../api/booking.api';
import { useBranch } from '../useBranch';

export const useBookings = () => {
  const { currentBranchId } = useBranch();
  const queryClient = useQueryClient();

  const bookingsQuery = useQuery({
    queryKey: ['bookings', currentBranchId],
    queryFn: () => fetchBookingsApi(currentBranchId).then((res) => res.data)
  });

  const createBookingMutation = useMutation({
    mutationFn: (newBooking: any) => createBookingApi({ ...newBooking, branchId: currentBranchId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', currentBranchId] });
      queryClient.invalidateQueries({ queryKey: ['tables', currentBranchId] }); // table state could change
    }
  });

  const updateBookingStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) => updateBookingStatusApi(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', currentBranchId] });
      queryClient.invalidateQueries({ queryKey: ['tables', currentBranchId] });
    }
  });

  return {
    bookings: bookingsQuery.data || [],
    isLoadingBookings: bookingsQuery.isLoading,
    refetchBookings: bookingsQuery.refetch,

    createBooking: createBookingMutation.mutateAsync,
    isCreatingBooking: createBookingMutation.isPending,

    updateBookingStatus: updateBookingStatusMutation.mutateAsync,
    isUpdatingStatus: updateBookingStatusMutation.isPending
  };
};
