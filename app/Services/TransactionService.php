<?php

namespace App\Services;

use App\Enums\CashMovementType;
use App\Models\CashMovement;
use App\Models\CashSession;
use App\Models\Currency;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;

class TransactionService
{
    public function calculateCore(int $fromCurrencyId, int $toCurrencyId, float $amount): array
    {
        $fromCurrency = Currency::findOrFail($fromCurrencyId);
        $toCurrency = Currency::findOrFail($toCurrencyId);

        $usdAmount = $amount / $fromCurrency->rate_to_usd;
        $finalAmount = $usdAmount * $toCurrency->rate_to_usd;

        return [
            'from_currency_id' => $fromCurrencyId,
            'to_currency_id' => $toCurrencyId,
            'original_amount' => round($amount, 2),
            'converted_amount' => round($finalAmount, 2),
            'from_rate_to_usd' => round($fromCurrency->rate_to_usd, 6),
            'to_rate_to_usd' => round($toCurrency->rate_to_usd, 6),
        ];
    }

    public function createTransaction(array $data)
    {
        $currentSession = CashSession::whereIn('status', ['active'])->first();
        if (! $currentSession) {
            throw new \Exception('Cannot record transaction. No open cash session.');
        }

        $calc = $this->calculateCore(
            $data['from_currency_id'],
            $data['to_currency_id'],
            $data['original_amount']
        );

        $transaction = Transaction::create([
            'customer_id' => null,
            'user_id' => Auth::id(),
            'cash_session_id' => $currentSession->id,
            'from_currency_id' => $calc['from_currency_id'],
            'to_currency_id' => $calc['to_currency_id'],

            'original_amount' => $calc['original_amount'],
            'converted_amount' => $calc['converted_amount'],

            // Snapshots
            'from_rate_to_usd' => $calc['from_rate_to_usd'],
            'to_rate_to_usd' => $calc['to_rate_to_usd'],
            'status' => 'pending',
        ]);

        CashMovement::create([
            'transaction_id' => $transaction->id,
            'currency_id' => $calc['from_currency_id'],
            'type' => CashMovementType::IN->value,
            'amount' => $calc['original_amount'],
            'cash_session_id' => $currentSession->id,
        ]);

        CashMovement::create([
            'transaction_id' => $transaction->id,
            'currency_id' => $calc['to_currency_id'],
            'type' => CashMovementType::OUT->value,
            'amount' => $calc['converted_amount'],
            'cash_session_id' => $currentSession->id,
        ]);

        return $transaction;
    }
}
