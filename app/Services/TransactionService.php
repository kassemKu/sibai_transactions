<?php

namespace App\Services;

use App\Enums\TransactionStatusEnum;
use App\Models\CashBalance;
use App\Models\Currency;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;

class TransactionService
{
    public function calculateCore(int $fromCurrencyId, int $toCurrencyId, float $amount): array
    {
        $fromCurrency = Currency::findOrFail($fromCurrencyId);
        $toCurrency = Currency::findOrFail($toCurrencyId);

        // 1️⃣ Conversion to USD
        $usdAmount = $amount / $fromCurrency->sell_rate_to_usd;

        // 2️⃣ Conversion to target currency
        $convertedAmount = $usdAmount * $toCurrency->buy_rate_to_usd;

        // 3️⃣ Margins
        $fromCurrencyMargin = $fromCurrency->rate_to_usd - $fromCurrency->sell_rate_to_usd;
        $toCurrencyMargin = $toCurrency->buy_rate_to_usd - $toCurrency->rate_to_usd;

        // 4️⃣ Raw profit before normalization
        $rawProfitFrom = $fromCurrencyMargin * $usdAmount;
        $rawProfitTo = $toCurrencyMargin * $usdAmount;

        // 5️⃣ Normalized profit in USD
        $profitFromUSD = $rawProfitFrom / $fromCurrency->rate_to_usd;
        $profitToUSD = $rawProfitTo / $toCurrency->rate_to_usd;

        $totalProfitUSD = $profitFromUSD + $profitToUSD;

        return [
            'from_currency_id' => $fromCurrencyId,
            'to_currency_id' => $toCurrencyId,
            'original_amount' => round($amount, 2),
            'converted_amount' => round($convertedAmount, 2),
            'usd_intermediate' => round($usdAmount, 2),
            'profit_from_usd' => round($profitFromUSD, 2),
            'profit_to_usd' => round($profitToUSD, 2),
            'total_profit_usd' => round($totalProfitUSD, 2),
            'from_currency_rates_snapshot' => [
                'rate_to_usd' => $fromCurrency->rate_to_usd,
                'buy_rate_to_usd' => $fromCurrency->buy_rate_to_usd,
                'sell_rate_to_usd' => $fromCurrency->sell_rate_to_usd,
            ],
            'to_currency_rates_snapshot' => [
                'rate_to_usd' => $toCurrency->rate_to_usd,
                'buy_rate_to_usd' => $toCurrency->buy_rate_to_usd,
                'sell_rate_to_usd' => $toCurrency->sell_rate_to_usd,
            ],
        ];
    }

    public function calculateProfitsFromConvertedAmount(int $fromCurrencyId, int $toCurrencyId, float $convertedAmount): array
    {
        $fromCurrency = Currency::findOrFail($fromCurrencyId);
        $toCurrency = Currency::findOrFail($toCurrencyId);

        // 1️⃣ Estimate USD amount from convertedAmount
        $usdAmount = $convertedAmount / $toCurrency->sell_rate_to_usd;

        // 2️⃣ Margins
        $fromCurrencyMargin = $fromCurrency->rate_to_usd - $fromCurrency->buy_rate_to_usd;
        $toCurrencyMargin = $toCurrency->sell_rate_to_usd - $toCurrency->rate_to_usd;

        // 3️⃣ Raw profits
        $rawProfitFrom = $fromCurrencyMargin * $usdAmount;
        $rawProfitTo = $toCurrencyMargin * $usdAmount;

        // 4️⃣ Normalized profits in USD
        $profitFromUSD = $rawProfitFrom / $fromCurrency->rate_to_usd;
        $profitToUSD = $rawProfitTo / $toCurrency->rate_to_usd;
        $totalProfitUSD = $profitFromUSD + $profitToUSD;

        return [
            'profit_from_usd' => round($profitFromUSD, 2),
            'profit_to_usd' => round($profitToUSD, 2),
            'total_profit_usd' => round($totalProfitUSD, 2),
        ];
    }

    public function createTransaction(array $data, $currentSession)
    {
        $user = Auth::user();
        $assignedTo = null;

        // Handle assigned_to for admin users (both super_admin and admin roles)
        if ($user->hasRole(['super_admin', 'admin']) && isset($data['assigned_to'])) {
            $assignedTo = $data['assigned_to'];
        }

        $transaction = Transaction::create([
            'customer_id' => null,
            'created_by' => $user->id,
            'cash_session_id' => $currentSession->id,
            'from_currency_id' => $data['from_currency_id'],
            'to_currency_id' => $data['to_currency_id'],
            'original_amount' => $data['original_amount'],
            'converted_amount' => $data['converted_amount'],
            'assigned_to' => $assignedTo,
            'status' => TransactionStatusEnum::PENDING->value,
            'notes' => $data['notes'] ?? null,
            'profit_from_usd' => $data['profit_from_usd'],
            'profit_to_usd' => $data['profit_to_usd'],
            'total_profit_usd' => $data['total_profit_usd'],
            'usd_intermediate' => $data['usd_intermediate'],
            'from_currency_rates_snapshot' => $data['from_currency_rates_snapshot'],
            'to_currency_rates_snapshot' => $data['to_currency_rates_snapshot'],
        ]);

        return $transaction;
    }

    public function getCurrencyAvailableBalance($currencyId, $session)
    {
        $currency = Currency::find($currencyId);

        $opening = CashBalance::where('cash_session_id', $session->id)
            ->where('currency_id', $currency->id)
            ->first()
            ->opening_balance ?? 0;

        $totalIn = Transaction::where('from_currency_id', $currency->id)
            ->where('cash_session_id', $session->id)
            // ->where('sub', false)
            ->where('status', TransactionStatusEnum::COMPLETED->value)
            ->where('created_by', auth()->id())
            ->sum('original_amount');

        $totalOut = Transaction::where('to_currency_id', $currency->id)
            ->where('cash_session_id', $session->id)
            // ->where('sub', false)
            ->where('status', TransactionStatusEnum::COMPLETED->value)
            ->where('closed_by', auth()->id())
            ->sum('converted_amount');

        $systemClosing = $opening + $totalIn - $totalOut;

        return [
            'currency_id' => $currency->id,
            'currency' => [
                'id' => $currency->id,
                'name' => $currency->name,
                'code' => $currency->code,
                'rate_to_usd' => $currency->rate_to_usd,
            ],
            'opening_balance' => $opening,
            'total_in' => $totalIn,
            'total_out' => $totalOut,
            'system_closing_balance' => $systemClosing,
        ];
    }

    // public function hasSufficientBalance($currencyId, $amount)
    // {
    //     $closingBalance = $this->getCurrencyAvailableBalance($currencyId);

    //     return $closingBalance >= $amount;
    // }
}
