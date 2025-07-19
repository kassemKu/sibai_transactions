<?php

namespace App\Services;

use App\Enums\CashMovementTypeEnum;
use App\Enums\CashSessionEnum;
use App\Enums\TransactionStatusEnum;
use App\Models\CashBalance;
use App\Models\CashMovement;
use App\Models\CashSession;
use App\Models\Currency;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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

    public function calculateProfitsFromConvertedAmount(
        int $fromCurrencyId,
        int $toCurrencyId,
        float $convertedAmount
    ): array {
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
        $assignedTo = $user->hasRole('super_admin') ? $data['assigned_to'] : null;

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

    public function confirmCashMovement(Transaction $transaction)
    {
        DB::transaction(function () use ($transaction) {

            CashMovement::create([
                'transaction_id' => $transaction->id,
                'currency_id' => $transaction->from_currency_id,
                'type' => CashMovementTypeEnum::IN->value,
                'amount' => $transaction->original_amount,
                'cash_session_id' => $transaction->cash_session_id,
                'exchange_rate' => $transaction->from_currency_rates_snapshot['buy_rate_to_usd'],
                'by' => $transaction->created_by,
                'sub' => $transaction->created_by != $transaction->closed_by, // Only mark as sub if created and closed by different users
            ]);

            CashMovement::create([
                'transaction_id' => $transaction->id,
                'currency_id' => $transaction->to_currency_id,
                'type' => CashMovementTypeEnum::OUT->value,
                'amount' => $transaction->converted_amount,
                'cash_session_id' => $transaction->cash_session_id,
                'exchange_rate' => $transaction->to_currency_rates_snapshot['sell_rate_to_usd'],
                'by' => $transaction->closed_by,
            ]);
        });
    }

    public function confirmCasherCashMovement(Transaction $transaction)
    {
        DB::transaction(function () use ($transaction) {
            CashMovement::create([
                'transaction_id' => $transaction->id,
                'currency_id' => $transaction->from_currency_id,
                'type' => CashMovementTypeEnum::IN->value,
                'amount' => $transaction->original_amount,
                'cash_session_id' => $transaction->cash_session_id,
                'exchange_rate' => $transaction->from_currency_rates_snapshot['buy_rate_to_usd'],
                'by' => $transaction->created_by,
            ]);

            CashMovement::create([
                'transaction_id' => $transaction->id,
                'currency_id' => $transaction->to_currency_id,
                'type' => CashMovementTypeEnum::OUT->value,
                'amount' => $transaction->converted_amount,
                'cash_session_id' => $transaction->cash_session_id,
                'exchange_rate' => $transaction->to_currency_rates_snapshot['sell_rate_to_usd'],
                'by' => $transaction->closed_by,
                'sub' => true,
            ]);
        });
    }

    public function getCurrencyAvailableBalance($currencyId)
    {
        $session = CashSession::whereIn('status', [CashSessionEnum::ACTIVE->value, CashSessionEnum::PENDING->value])->first();
        if (! $session) {
            throw new \Exception('No open cash session found.');
        }

        $opening = CashBalance::where('cash_session_id', $session->id)
            ->where('currency_id', $currencyId)
            ->first()
            ->opening_balance ?? 0;

        $totalIn = CashMovement::whereHas('transaction', fn ($q) => $q->where('cash_session_id', $session->id)->where('status', TransactionStatusEnum::COMPLETED->value))
            ->where('currency_id', $currencyId)
            ->where('type', CashMovementTypeEnum::IN->value)
            ->sum('amount');

        $totalOut = CashMovement::whereHas('transaction', fn ($q) => $q->where('cash_session_id', $session->id)->where('status', TransactionStatusEnum::COMPLETED->value))
            ->where('currency_id', $currencyId)
            ->where('type', CashMovementTypeEnum::OUT->value)
            ->sum('amount');

        return $opening + $totalIn - $totalOut;
    }

    public function hasSufficientBalance($currencyId, $amount)
    {
        $closingBalance = $this->getCurrencyAvailableBalance($currencyId);

        return $closingBalance >= $amount;
    }
}
