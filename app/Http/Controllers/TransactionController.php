<?php

namespace App\Http\Controllers;

use App\Enums\TransactionStatusEnum;
use App\Http\Requests\TransactionCalculateRequest;
use App\Http\Requests\TransactionRequest;
use App\Models\Transaction;
use App\Services\TransactionService;

class TransactionController extends Controller
{
    protected $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    public function store(TransactionRequest $request)
    {
        try {
            $calc = $request->getCalc();
            $convertedAmount = $request->converted_amount;

            $profits = $this->transactionService->calculateProfitsFromConvertedAmount(
                $calc['from_currency_id'],
                $calc['to_currency_id'],
                $convertedAmount
            );

            $calc['converted_amount'] = $request->converted_amount;
            $calc['profit_from_usd'] = $profits['profit_from_usd'];
            $calc['profit_to_usd'] = $profits['profit_to_usd'];
            $calc['total_profit_usd'] = $profits['total_profit_usd'];

            $result = array_merge($calc, ['assigned_to' => $request->assigned_to]);
            $transaction = $this->transactionService->createTransaction($result, $request->session);

            return $this->success('تم إنشاء المعاملة بنجاح.', [
                'transaction' => $transaction,
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'TransactionController@store');

            return $this->failed('حدث خطأ أثناء إنشاء المعاملة');
        }
    }

    public function completeStatus(Transaction $transaction)
    {
        try {
            $this->transactionService->confirmCashMovement($transaction);

            $transaction->update([
                'status' => TransactionStatusEnum::COMPLETED->value,
                'closed_by' => auth()->id(),
            ]);

            return $this->success('تم تغيير حالة المعاملة إلى مكتملة.', [
                'transaction' => $transaction->refresh(),
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'TransactionController@completeStatus');

            return $this->failed('حدث خطأ أثناء إكمال المعاملة');
        }
    }

    public function cancelStatus(Transaction $transaction)
    {
        try {
            $transaction->update([
                'status' => TransactionStatusEnum::CANCELED->value,
                'closed_by' => auth()->id(),
            ]);

            return $this->success('تم إلغاء المعاملة بنجاح.', [
                'transaction' => $transaction->refresh(),
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'TransactionController@cancelStatus');

            return $this->failed('حدث خطأ أثناء إلغاء المعاملة');
        }
    }

    public function calc(TransactionCalculateRequest $request, TransactionService $service)
    {
        $result = $service->calculateCore(
            $request->from_currency_id,
            $request->to_currency_id,
            $request->original_amount
        );

        return $this->success('نتيجة الحساب', [
            'calculation_result' => $result,
        ]);
    }

    public function show(Transaction $transaction)
    {
        return inertia('Transactions/Show')->with([
            'transaction' => $transaction->load([
                'fromCurrency',
                'toCurrency',
                'createdBy',
                'closedBy',
                'assignedTo',
                'cashMovements',
            ]),
        ]);
    }
}
