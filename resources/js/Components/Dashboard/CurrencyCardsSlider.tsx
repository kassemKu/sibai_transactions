import React, { useState, useRef, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { CurrenciesResponse, Currency } from '@/types';
import CurrencyCard from './CurrencyCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
// import 'swiper/css/autoplay';

interface CurrencyCardsSliderProps {
  currencies: CurrenciesResponse;
  onEditCurrency?: (currency: Currency) => void;
  isEditable?: boolean;
}

export default function CurrencyCardsSlider({
  currencies,
  onEditCurrency,
  isEditable = false,
}: CurrencyCardsSliderProps) {
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const swiperRef = useRef<any>(null);

  const handleSwiperInit = useCallback((swiper: any) => {
    swiperRef.current = swiper;
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  }, []);
  const handleManualNavigation = useCallback(() => {
    if (swiperRef.current) {
      setIsBeginning(swiperRef.current.isBeginning);
      setIsEnd(swiperRef.current.isEnd);
    }
  }, []);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="text-bold-x18 text-text-black">
          إليك أسعار العملات طبقاً للدولار الأمريكي
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`currency-prev-btn p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-200 shadow-sm ${isBeginning ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
              }`}
            onClick={() => {
              swiperRef.current?.slidePrev();
              handleManualNavigation();
            }}
            disabled={isBeginning}
            title="السابق"
            aria-label="الانتقال إلى الشريحة السابقة"
          >
            <FiChevronRight className="w-4 h-4 text-gray-600" />
          </button>
          <button
            className={`currency-next-btn p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-200 shadow-sm ${isEnd ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
              }`}
            onClick={() => {
              swiperRef.current?.slideNext();
              handleManualNavigation();
            }}
            disabled={isEnd}
            title="التالي"
            aria-label="الانتقال إلى الشريحة التالية"
          >
            <FiChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <Swiper
          ref={swiperRef}
          modules={[Navigation, Autoplay]}
          // autoplay={{
          //   delay: 3000,
          //   disableOnInteraction: false,
          //   pauseOnMouseEnter: true,
          // }}
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
          onSwiper={handleSwiperInit}
          grabCursor={true}
          className="!overflow-visible"
        >
          {currencies.shift() &&
            currencies.map(currency => (
              <SwiperSlide key={currency.id}>
                <CurrencyCard
                  currency={currency}
                  currencies={currencies}
                  onEdit={onEditCurrency}
                  isEditable={isEditable}
                />
              </SwiperSlide>
            ))}
        </Swiper>
      </div>
    </div>
  );
}
