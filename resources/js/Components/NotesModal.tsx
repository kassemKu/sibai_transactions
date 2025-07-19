import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@heroui/react';
import { Transaction } from '@/types';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export default function NotesModal({
  isOpen,
  onClose,
  transaction,
}: NotesModalProps) {
  // Don't render if modal is not open
  if (!isOpen) return null;

  // Handle case where no transaction is selected
  if (!transaction) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">📝</span>
              <span>ملاحظة المعاملة</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-500 text-center">لا توجد معاملة محددة</p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={onClose}>
              إغلاق
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  // Handle case where transaction has no notes
  if (!transaction.notes || transaction.notes.trim() === '') {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">📝</span>
              <span>ملاحظة المعاملة</span>
              <span className="text-sm text-gray-500">#{transaction.id}</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-500 text-center">
                لا توجد ملاحظات لهذه المعاملة
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={onClose}>
              إغلاق
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">📝</span>
            <span>ملاحظة المعاملة</span>
            <span className="text-sm text-gray-500">#{transaction.id}</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            <div className="text-gray-800 whitespace-pre-wrap leading-relaxed break-words overflow-hidden word-wrap">
              {transaction.notes}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={onClose}>
            إغلاق
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
