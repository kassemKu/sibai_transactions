import React from 'react';
import {
  TableCell,
  TableRow,
  TableBody,
  TableHeader,
  TableColumn,
  Table,
} from '@heroui/react';

export default function RecentTransactionsTable() {
  return (
    <div className="w-full mb-8">
      <Table
        aria-label="Recent transactions table"
        topContent={
          <div className="mb-1 text-bold-x14 text-[#1F2937] flex flex-col gap-2">
            <div>المعاملات الأخيرة</div>
            <div className="text-med-x14 text-text-grey-light">
              نشاط معاملاتك الأحدث
            </div>
          </div>
        }
      >
        <TableHeader>
          <TableColumn>الوقت</TableColumn>
          <TableColumn>المبلغ المحول</TableColumn>
          <TableColumn>المبلغ المحصل</TableColumn>
          <TableColumn>الصراف</TableColumn>
          <TableColumn>الحالة</TableColumn>
        </TableHeader>
        <TableBody>
          <TableRow key="1">
            <TableCell>10:00</TableCell>
            <TableCell>10000SYP</TableCell>
            <TableCell>10000SYP</TableCell>
            <TableCell>John Doe</TableCell>
            <TableCell>مكتملة</TableCell>
          </TableRow>
          <TableRow key="2">
            <TableCell>10:00</TableCell>
            <TableCell>20000SYP</TableCell>
            <TableCell>10000SYP</TableCell>
            <TableCell>John Doe</TableCell>
            <TableCell>تم الالغاء</TableCell>
          </TableRow>
          <TableRow key="3">
            <TableCell>9:20</TableCell>
            <TableCell>10000SYP</TableCell>
            <TableCell>10000SYP</TableCell>
            <TableCell>John Doe</TableCell>
            <TableCell>مكتملة</TableCell>
          </TableRow>
          <TableRow key="4">
            <TableCell>12:12</TableCell>
            <TableCell>10000SYP</TableCell>
            <TableCell>10000SYP</TableCell>
            <TableCell>John Doe</TableCell>
            <TableCell>معلقة</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
