"use client";

import { useCallback, useMemo, useState } from "react";

interface UseRowActionModalStateOptions {
  enableView?: boolean;
  enableDelete?: boolean;
  enableEdit?: boolean;
}
export const useRowActionModalState = <TData>({
  enableView,
  enableDelete,
  enableEdit,
}: UseRowActionModalStateOptions = {}) => {
  const [viewingItem, setViewingItem] = useState<TData | null>(null);
  const [deletingItem, setDeletingItem] = useState<TData | null>(null);

  const [editingItem, setEditingItem] = useState<TData | null>(null);

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleView = useCallback((item: TData) => {
    setViewingItem(item);
    setIsViewDialogOpen(true);
  }, []);

  const handleDelete = useCallback((item: TData) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleEdit = useCallback((item: TData) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  }, []);
  const onViewOpenChange = useCallback((open: boolean) => {
    setIsViewDialogOpen(open);
    if (!open) {
      setViewingItem(null);
    }
  }, []);

  const onDeleteOpenChange = useCallback((open: boolean) => {
    setIsDeleteDialogOpen(open);
    if (!open) {
      setDeletingItem(null);
    }
  }, []);

  const onEditOpenChange = useCallback((open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setEditingItem(null);
    }
  }, []);
  const tableActions = useMemo(() => {
    return {
      onView: enableView ? handleView : undefined,
      onDelete: enableDelete ? handleDelete : undefined,
      onEdit: enableEdit ? handleEdit : undefined,
    };
  }, [
    enableView,
    enableDelete,
    enableEdit,
    handleView,
    handleDelete,
    handleEdit,
  ]);
  return {
    viewingItem,
    deletingItem,
    editingItem,
    isViewDialogOpen,
    isDeleteDialogOpen,
    isEditDialogOpen,
    tableActions,
    onViewOpenChange,
    onDeleteOpenChange,
    onEditOpenChange,
  };
};
