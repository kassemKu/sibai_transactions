import React, { useState, useRef } from 'react';
import RootLayout from '@/Layouts/RootLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Card, CardContent, CardHeader } from '@/Components/UI/Card';
import { Currency, CurrenciesResponse } from '@/types';
import {
  FiArrowUp,
  FiArrowDown,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper modules
import { Navigation, Autoplay } from 'swiper/modules';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SecondaryButton from '@/Components/SecondaryButton';
import Select from '@/Components/Select';
import { usePage } from '@inertiajs/react';
import {
  Input,
  TableCell,
  TableRow,
  TableBody,
  TableHeader,
  TableColumn,
  Table,
} from '@heroui/react';

interface DashboardProps {
  currencies: CurrenciesResponse;
  cashSessions: any;
}

export default function Dashboard({
  currencies,
  cashSessions,
}: DashboardProps) {
  const { auth, cash_session } = usePage().props;
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const swiperRef = useRef<any>(null);

  // Sample dashboard data - replace with real data from your backend
  console.log('currencies',currencies)
  console.log('CashSessions', cashSessions);
  console.log('auth', auth);
  console.log('cash_session', cash_session);
  const stats = [
    {
      name: 'إجمالي المعاملات',
      value: '1,234',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      name: 'إجمالي الإيرادات',
      value: '$45,231',
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      name: 'الجلسات النشطة',
      value: '12',
      change: '-2%',
      changeType: 'negative' as const,
    },
    {
      name: 'المعاملات المعلقة',
      value: '23',
      change: '+4%',
      changeType: 'positive' as const,
    },
  ];

  const recentTransactions = [
    {
      id: 1,
      type: 'دائن',
      amount: '$1,200',
      currency: 'USD',
      status: 'مكتملة',
      time: 'منذ ساعتين',
    },
    {
      id: 2,
      type: 'مدين',
      amount: '$850',
      currency: 'EUR',
      status: 'معلقة',
      time: 'منذ 4 ساعات',
    },
    {
      id: 3,
      type: 'دائن',
      amount: '$2,100',
      currency: 'USD',
      status: 'مكتملة',
      time: 'منذ 6 ساعات',
    },
    {
      id: 4,
      type: 'مدين',
      amount: '$450',
      currency: 'GBP',
      status: 'فاشلة',
      time: 'منذ 8 ساعات',
    },
  ];

  const headerActions = (
    <div className="flex items-center space-x-3 space-x-reverse">
      <PrimaryButton className="text-sm">معاملة جديدة</PrimaryButton>
    </div>
  );

  const handleSlideChange = (swiper: any) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  return (
    <RootLayout
      title="لوحة التحكم"
      breadcrumbs={[{ label: 'لوحة التحكم' }]}
      headerActions={headerActions}
    >
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">أهلاً بك مرة أخرى!</h1>
        <p className="mt-1 text-sm text-gray-600">
          إليك ما يحدث مع معاملاتك اليوم.
        </p>
      </div>

      {/* Currency Cards Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="text-bold-x18 text-text-black">
            إليك أسعار العملات طبقاً للدولار الأمريكي
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`currency-prev-btn p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-200 shadow-sm ${
                isBeginning
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:shadow-md'
              }`}
              onClick={() => swiperRef.current?.slidePrev()}
              disabled={isBeginning}
              title="السابق"
              aria-label="الانتقال إلى الشريحة السابقة"
            >
              <FiChevronRight className="w-4 h-4 text-gray-600" />
            </button>
            <button
              className={`currency-next-btn p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-200 shadow-sm ${
                isEnd ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
              }`}
              onClick={() => swiperRef.current?.slideNext()}
              disabled={isEnd}
              title="التالي"
              aria-label="الانتقال إلى الشريحة التالية"
            >
              <FiChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Horizontal Scrolling Currency Cards */}
        <div className="relative overflow-hidden">
          <Swiper
            ref={swiperRef}
            modules={[Navigation, Autoplay]}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            spaceBetween={160}
            loop={false}
            centeredSlides={false}
            watchSlidesProgress={true}
            breakpoints={{
              320: {
                slidesPerView: 1,
                spaceBetween: 16,
              },
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 4,
              },
              1280: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
              1536: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
            }}
            onSlideChange={handleSlideChange}
            onSwiper={swiper => {
              swiperRef.current = swiper;
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
            }}
            onReachEnd={() => setIsEnd(true)}
            onReachBeginning={() => setIsBeginning(true)}
            onFromEdge={() => {
              setIsBeginning(false);
              setIsEnd(false);
            }}
            grabCursor={true}
            className="!overflow-visible"
          >
            {currencies &&
              currencies.map((currency: Currency) => (
                <SwiperSlide key={currency.id}>
                  <Card
                    className="currency-card border border-gray-200 hover:border-gray-300 bg-gradient-to-br from-white to-gray-50 w-[280px] cursor-grab active:cursor-grabbing"
                    padding="xs"
                  >
                    <CardContent className="flex flex-col justify-between gap-4 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {currency.code.substring(0, 3)}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-bold-x16 text-text-black">
                              {currency.name}
                            </h3>
                            <span className="text-med-x14 text-text-grey-light">
                              {currency.code}
                            </span>
                          </div>
                        </div>
                        {/* Currency movement arrow - alternating for demo */}
                        <div className="flex items-center gap-1">
                          {currency.id % 2 === 0 ? (
                            <>
                              <FiArrowUp className="w-4 h-4 text-green-500" />
                              <span className="text-xs text-green-500 font-medium">
                                +2.5%
                              </span>
                            </>
                          ) : (
                            <>
                              <FiArrowDown className="w-4 h-4 text-red" />
                              <span className="text-xs text-red font-medium">
                                -1.2%
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-bold-x20 text-primaryBlue font-bold">
                            {parseFloat(
                              currency.currency_rate.rate_to_usd,
                            ).toLocaleString('ar-EG', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 6,
                            })}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 text-right bg-gray-100 px-2 py-1 rounded-full">
                          مقابل 1 دولار أمريكي
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </SwiperSlide>
              ))}
          </Swiper>
        </div>
      </div>
      <div className="w-full mb-8">
        <Card>
          <CardContent className="p-2">
            <div className="flex flex-col gap-6">
              {/* Header */}
              <div className="flex flex-col gap-2">
                <div className="text-bold-x18 text-text-black">عملية جديدة</div>
                <div className="text-med-x14 text-text-grey-light">
                  إنشاء عملية تحويل جديدة
                </div>
              </div>

              {/* Form */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* From Section */}
                <div className="space-y-4">
                  <div className="text-bold-x16 text-text-black">من</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <InputLabel htmlFor="from_currency" className="mb-2">
                        اختر العملة
                      </InputLabel>
                      <Select
                        id="from_currency"
                        aria-label="اختر العملة المصدر"
                        placeholder="اختر العملة"
                      >
                        {currencies.map(currency => (
                          <option key={currency.id} value={currency.code}>
                            {currency.name} ({currency.code})
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <InputLabel htmlFor="from_amount" className="mb-2">
                        المبلغ
                      </InputLabel>
                      <TextInput
                        id="from_amount"
                        type="number"
                        placeholder="أدخل المبلغ"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* To Section */}
                <div className="space-y-4">
                  <div className="text-bold-x16 text-text-black">إلى</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <InputLabel htmlFor="to_currency" className="mb-2">
                        اختر العملة
                      </InputLabel>
                      <Select
                        id="to_currency"
                        aria-label="اختر العملة الهدف"
                        placeholder="اختر العملة"
                      >
                        {currencies.map(currency => (
                          <option key={currency.id} value={currency.code}>
                            {currency.name} ({currency.code})
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <InputLabel htmlFor="to_amount" className="mb-2">
                        المبلغ المحسوب
                      </InputLabel>
                      <TextInput
                        id="to_amount"
                        type="number"
                        placeholder="سيتم الحساب تلقائياً"
                        className="w-full bg-gray-50"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex justify-between gap-3 pt-4 items-center bg-[#EFF6FF] p-4 rounded-xl">
                <div className="text-med-x14  flex flex-col items-start gap-2">
                  <span className="text-[#6B7280] text-med-x14">يتم تسليم العميل مبلغ</span>
                  <span className="text-bold-x20 text-[#10B981] font-bold">
                    3,673.50 SYP
                  </span>
                </div>
                <div className="flex gap-3">
                  <SecondaryButton>اعاده التعيين</SecondaryButton>
                  <PrimaryButton>تنفيذ العملية</PrimaryButton>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="w-full mb-8">
        <Table
          aria-label="Example static collection table"
          topContent={
            <div className="mb-1 text-bold-x14 text-[#1F2937] flex flex-col gap-2">
                <div>المعاملات الأخيرة</div>
                <div className="text-med-x14 text-text-grey-light">نشاط معاملاتك الأحدث</div>
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
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              المعاملات الأخيرة
            </h3>
            <p className="mt-1 text-sm text-gray-500">نشاط معاملاتك الأحدث</p>
          </div>
          <div className="px-6 py-4">
            <div className="flow-root">
              <ul role="list" className="-my-5 divide-y divide-gray-200">
                {recentTransactions.map(transaction => (
                  <li key={transaction.id} className="py-4">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="flex-shrink-0">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                            transaction.type === 'دائن'
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`}
                        >
                          {transaction.type === 'دائن' ? '+' : '-'}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {transaction.type} - {transaction.amount}{' '}
                          {transaction.currency}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {transaction.time}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.status === 'مكتملة'
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === 'معلقة'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <a
                href="#"
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                عرض جميع المعاملات
              </a>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              الإجراءات السريعة
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              المهام الشائعة والاختصارات
            </p>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </div>
                <div className="mr-3 text-right">
                  <p className="text-sm font-medium text-gray-900">
                    إنشاء معاملة
                  </p>
                  <p className="text-sm text-gray-500">إضافة سجل معاملة جديد</p>
                </div>
              </button>

              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                    />
                  </svg>
                </div>
                <div className="mr-3 text-right">
                  <p className="text-sm font-medium text-gray-900">
                    إنشاء تقرير
                  </p>
                  <p className="text-sm text-gray-500">
                    إنشاء التقارير المالية
                  </p>
                </div>
              </button>

              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m0 0v9a1.5 1.5 0 001.5 1.5h9M7.5 15a1.5 1.5 0 01-1.5-1.5V9A1.5 1.5 0 017.5 7.5h9a1.5 1.5 0 011.5 1.5v6a1.5 1.5 0 01-1.5 1.5H9a1.5 1.5 0 01-1.5-1.5z"
                    />
                  </svg>
                </div>
                <div className="mr-3 text-right">
                  <p className="text-sm font-medium text-gray-900">
                    إدارة العملات
                  </p>
                  <p className="text-sm text-gray-500">تحديث أسعار الصرف</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
