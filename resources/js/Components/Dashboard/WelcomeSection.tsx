import React from 'react';

interface WelcomeSectionProps {
  userName?: string;
}

export default function WelcomeSection({ userName }: WelcomeSectionProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">
        أهلاً بك مرة أخرى{userName ? ` ${userName}` : ''}!
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        إليك ما يحدث مع معاملاتك اليوم.
      </p>
    </div>
  );
}
