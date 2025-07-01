<?php

namespace App\Services;

use App\Enums\CashMovementType;
use App\Models\CashMovement;
use App\Models\CashSession;
use App\Models\CurrencyRate;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;

class TransactionService
{
    private function calculateCore(int $fromCurrencyId, int $toCurrencyId, float $amount): array
    {
        $fromRate = CurrencyRate::where('currency_id', $fromCurrencyId)
            ->latest('date')
            ->firstOrFail();

        $toRate = CurrencyRate::where('currency_id', $toCurrencyId)
            ->latest('date')
            ->firstOrFail();

        $effectiveFromRate = $fromRate->rate_to_usd * (1 + $fromRate->profit_margin_percent / 100);
        $effectiveToRate = $toRate->rate_to_usd * (1 + $toRate->profit_margin_percent / 100);

        $usdAmount = $amount * $effectiveFromRate;

        $finalAmount = $usdAmount / $effectiveToRate;

        $profitUsd = ($effectiveToRate - $toRate->rate_to_usd) * ($usdAmount / $toRate->rate_to_usd);

        return [
            'from_currency_id' => $fromCurrencyId,
            'to_currency_id' => $toCurrencyId,
            'original_amount' => round($amount, 2),
            'converted_amount' => round($finalAmount, 2),
            'usd_intermediate' => round($usdAmount, 2),

            'from_rate_to_usd' => round($fromRate->rate_to_usd, 6),
            'from_margin' => round($fromRate->profit_margin_percent, 2),

            'to_rate_to_usd' => round($toRate->rate_to_usd, 6),
            'to_margin' => round($toRate->profit_margin_percent, 2),

            'exchange_rate_from_used' => round($effectiveFromRate, 6),
            'exchange_rate_to_used' => round($effectiveToRate, 6),

            'market_exchange_rate_to' => round($toRate->rate_to_usd, 6),

            'profit_usd' => round($profitUsd, 2),
        ];
    }

    public function calculateConversion(int $fromCurrencyId, int $toCurrencyId, float $amount): array
    {
        return $this->calculateCore($fromCurrencyId, $toCurrencyId, $amount);
    }

    public function createTransaction(array $data)
    {
        $currentSession = CashSession::where('is_closed', false)->first();
        if (! $currentSession) {
            throw new \Exception('Cannot record transaction. No open cash session.');
        }

        $calc = $this->calculateCore(
            $data['from_currency_id'],
            $data['to_currency_id'],
            $data['amount_original']
        );

        $transaction = Transaction::create([
            'customer_name' => $data['customer_name'] ?? null,
            'user_id' => Auth::id(),
            'cash_session_id' => $currentSession->id,
            'from_currency_id' => $calc['from_currency_id'],
            'to_currency_id' => $calc['to_currency_id'],

            'amount_original' => $calc['original_amount'],
            'converted_amount' => $calc['converted_amount'],

            'amount_usd' => $calc['usd_intermediate'],

            // Snapshots
            'from_rate_to_usd_snapshot' => $calc['from_rate_to_usd'],
            'from_profit_margin_snapshot' => $calc['from_margin'],
            'to_rate_to_usd_snapshot' => $calc['to_rate_to_usd'],
            'to_profit_margin_snapshot' => $calc['to_margin'],

            'exchange_rate_used' => $calc['exchange_rate_to_used'],
            'market_exchange_rate' => $calc['market_exchange_rate'],

            'profit_usd' => $calc['profit_usd'],
        ]);

        CashMovement::create([
            'transaction_id' => $transaction->id,
            'currency_id' => $calc['from_currency_id'],
            'type' => CashMovementType::IN,
            'amount' => $calc['original_amount'],
            'cash_session_id' => $currentSession->id,
        ]);

        CashMovement::create([
            'transaction_id' => $transaction->id,
            'currency_id' => $calc['to_currency_id'],
            'type' => CashMovementType::OUT,
            'amount' => $calc['converted_amount'],
            'cash_session_id' => $currentSession->id,
        ]);

        return $transaction;
    }
}
