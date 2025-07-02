<?php

namespace App\Http\Controllers;

use App\Models\CashBalance;
use App\Models\CashSession;
use App\Models\Currency;
use App\Models\SessionOpeningBalance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CashSessionController extends Controller
{
    public function startSession()
    {
        $userId = Auth::id();

        if (CashSession::where('is_closed', false)->exists()) {
            return response()->json(['success' => false, 'error' => 'There is already an open cash session.'], 400);
        }

        $currencies = Currency::all();
        $openingBalances = [];
        foreach ($currencies as $currency) {
            $lastBalance = CashBalance::where('currency_id', $currency->id)
                ->orderByDesc('id')
                ->first();
            $openingBalances[$currency->code] = $lastBalance ? $lastBalance->actual_closing_balance : 0;
        }

        DB::beginTransaction();
        try {
            $cashSession = CashSession::create([
                'opened_at' => now(),
                'closed_at' => null,
                'opened_by' => $userId,
                'closed_by' => null,
                'open_exchange_rates' => json_encode(Currency::pluck('rate_to_usd', 'currency_id')->toArray()),
                'close_exchange_rates' => null,
                'is_closed' => false,
            ]);

            foreach ($currencies as $currency) {
                $openingBalance = $openingBalances[$currency->code] ?? 0;
                SessionOpeningBalance::create([
                    'cash_session_id' => $cashSession->id,
                    'currency_id' => $currency->id,
                    'opening_balance' => $openingBalance,
                ]);
                CashBalance::create([
                    'cash_session_id' => $cashSession->id,
                    'currency_id' => $currency->id,
                    'opening_balance' => $openingBalance,
                    'total_in' => 0,
                    'total_out' => 0,
                    'closing_balance' => null,
                    'actual_closing_balance' => null,
                    'difference' => null,
                ]);
            }

            DB::commit();

            return response()->json(['success' => true, 'cash_session_id' => $cashSession->id]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * End (close) the latest open cash session.
     */
    public function endSession(Request $request)
    {
        $userId = Auth::id();
        DB::beginTransaction();
        try {
            $cashSession = CashSession::where('is_closed', false)->latest('opened_at')->first();
            if (! $cashSession) {
                return response()->json(['success' => false, 'error' => 'No open session found.'], 400);
            }

            $closingBalances = $request->input('closing_balances', []); // ['USD' => 123, ...]
            $actualClosingBalances = $request->input('actual_closing_balances', []); // ['USD' => 120, ...]

            $currencies = Currency::all();
            foreach ($currencies as $currency) {
                $cashBalance = CashBalance::where('cash_session_id', $cashSession->id)
                    ->where('currency_id', $currency->id)
                    ->first();
                if ($cashBalance) {
                    $closing = $closingBalances[$currency->code] ?? 0;
                    $actual = $actualClosingBalances[$currency->code] ?? 0;
                    $cashBalance->update([
                        'closing_balance' => $closing,
                        'actual_closing_balance' => $actual,
                        'difference' => $actual - $closing,
                    ]);
                }
            }

            $cashSession->update([
                'closed_at' => now(),
                'closed_by' => $userId,
                'close_exchange_rates' => json_encode(Currency::pluck('rate_to_usd', 'currency_id')->toArray()),
                'is_closed' => true,
            ]);
            DB::commit();

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
