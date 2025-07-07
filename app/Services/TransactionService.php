<?php

namespace App\Services;

use App\Enums\CashMovementType;
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

    public function createTransaction(array $data, $currentSession)
    {
        $user = Auth::user();
        $assignedTo = $user->hasRole('super_admin') ? $data['assigned_to'] : null;

        $transaction = Transaction::create([
            'customer_id' => null,
            'user_id' => $user->id,
            'cash_session_id' => $currentSession->id,
            'from_currency_id' => $data['from_currency_id'],
            'to_currency_id' => $data['to_currency_id'],
            'original_amount' => $data['original_amount'],
            'converted_amount' => $data['converted_amount'],
            'assigned_to' => $assignedTo,
            'from_rate_to_usd' => $data['from_rate_to_usd'],
            'to_rate_to_usd' => $data['to_rate_to_usd'],
            'status' => 'pending',
        ]);

        return $transaction;
    }

    public function confirmCashMovement(Transaction $transaction)
    {
        DB::transaction(function () use ($transaction) {
            CashMovement::create([
                'transaction_id' => $transaction->id,
                'currency_id' => $transaction->from_currency_id,
                'type' => CashMovementType::IN->value,
                'amount' => $transaction->original_amount,
                'cash_session_id' => $transaction->cash_session_id,
            ]);

            CashMovement::create([
                'transaction_id' => $transaction->id,
                'currency_id' => $transaction->to_currency_id,
                'type' => CashMovementType::OUT->value,
                'amount' => $transaction->converted_amount,
                'cash_session_id' => $transaction->cash_session_id,
            ]);
        });
    }

    public function getCurrencyAvailableBalance($currencyId)
    {
        $session = CashSession::whereIn('status', ['active', 'pending'])->first();
        if (! $session) {
            throw new \Exception('No open cash session found.');
        }

        $opening = CashBalance::where('cash_session_id', $session->id)
            ->where('currency_id', $currencyId)
            ->first()
            ->opening_balance ?? 0;

        $totalIn = CashMovement::whereHas('transaction', fn ($q) => $q->where('cash_session_id', $session->id)->where('status', 'completed'))
            ->where('currency_id', $currencyId)
            ->where('type', CashMovementType::IN->value)
            ->sum('amount');

        $totalOut = CashMovement::whereHas('transaction', fn ($q) => $q->where('cash_session_id', $session->id)->where('status', 'completed'))
            ->where('currency_id', $currencyId)
            ->where('type', CashMovementType::OUT->value)
            ->sum('amount');

        return $opening + $totalIn - $totalOut;
    }

    public function hasSufficientBalance($currencyId, $amount)
    {
        $closingBalance = $this->getCurrencyAvailableBalance($currencyId);

        return $closingBalance >= $amount;
    }
}
