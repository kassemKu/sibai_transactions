import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@heroui/react';
import { FiAlertTriangle, FiList, FiHome } from 'react-icons/fi';

interface PendingTransactionsConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  onGoToPending: () => void;
  pendingCount: number;
}

export default function PendingTransactionsConfirmModal({
  isOpen,
  onClose,
  onContinue,
  onGoToPending,
  pendingCount,
}: PendingTransactionsConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      placement="center"
      backdrop="blur"
      classNames={{
        base: 'bg-white',
        body: 'p-0',
        header: 'border-b border-gray-200 px-6 py-4',
        footer: 'border-t border-gray-200 px-6 py-4',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-full">
              <FiAlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                تحذير: معاملات معلقة
              </h2>
              <p className="text-sm text-gray-600">
                يوجد معاملات تحتاج إلى معالجة
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="px-6 py-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <FiList className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  يوجد {pendingCount} معاملة معلقة
                </p>
                <p className="text-sm text-yellow-700">
                  هذه المعاملات تحتاج إلى تأكيد قبل إغلاق الجلسة
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p className="mb-2">ماذا تريد أن تفعل؟</p>
              <ul className="space-y-1 text-xs">
                <li>
                  • <strong>المتابعة:</strong> إغلاق الجلسة مع ترك المعاملات
                  معلقة
                </li>
                <li>
                  • <strong>معالجة المعاملات:</strong> الذهاب إلى صفحة المعاملات
                  المعلقة أولاً
                </li>
              </ul>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-end gap-3">
          <Button
            variant="light"
            onPress={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            إلغاء
          </Button>
          <Button
            color="primary"
            variant="bordered"
            onPress={onGoToPending}
            startContent={<FiHome className="h-4 w-4" />}
            className="border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            معالجة المعاملات أولاً
          </Button>
          <Button
            color="warning"
            onPress={onContinue}
            startContent={<FiAlertTriangle className="h-4 w-4" />}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            المتابعة مع الإغلاق
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
