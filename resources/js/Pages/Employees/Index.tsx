import useRoute from "@/Hooks/useRoute"
import useTypedPage from "@/Hooks/useTypedPage"
import { PageHeader } from "@/Layouts/PageHeader"
import RootLayout from "@/Layouts/RootLayout"
import { User } from "@/types"
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react"
import React from "react"

const Index = () => {
    
  const route = useRoute()
  const { admins: { data } } = useTypedPage().props as any
  const breadcrumbs = [
    { label: 'الرئيسية', href: route('dashboard') },
    { label: 'الموظفين' },
  ]
  return (
    <RootLayout title="الموظفين" breadcrumbs={breadcrumbs}>
      <PageHeader title="الموظفين" subtitle="راقب و تولي ادارة عمليات صرف العملات" />
      <Table aria-label="Example empty table">
        <TableHeader>
          <TableColumn>id</TableColumn>
          <TableColumn>الأسم</TableColumn>
          <TableColumn>البريد الألكتروني</TableColumn>
          <TableColumn>الدور</TableColumn>
          <TableColumn>الحالة</TableColumn>
          <TableColumn>اجراء</TableColumn>
        </TableHeader>
        <TableBody>
          {
            data && data.length ?
              data.map(({ id, name, email, roles }: User) => {
                return (
                  <TableRow key={id}>
                    <TableCell>{id}</TableCell>
                    <TableCell>{name}</TableCell>
                    <TableCell>{email}</TableCell>
                    <TableCell>{roles[0].display_name}</TableCell>
                    <TableCell>{'status'}</TableCell>
                    <TableCell>{'status'}</TableCell>
                  </TableRow>
                )
              }
              ) : (
                <TableBody emptyContent={"لا يوجد بيانات لعرضها!"}>{[]}</TableBody>
              )
          }
        </TableBody>

      </Table>

    </RootLayout>
  )
}

export default Index