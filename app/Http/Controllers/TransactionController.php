<?php

namespace App\Http\Controllers;

use App\Enums\TransactionStatusEnum;
use App\Http\Requests\TransactionCalculateRequest;
use App\Http\Requests\TransactionRequest;
use App\Models\Transaction;
use App\Services\TransactionService;
use Illuminate\Http\Request;

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

            // Add notes to the calculation data if provided
            if ($request->has('notes') && $request->notes) {
                $calc['notes'] = $request->notes;
            }

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

    public function completeStatus(Request $request, Transaction $transaction)
    {
        try {
            $availableBalance = $this->transactionService->getCurrencyAvailableBalance($transaction->to_currency_id, $request->session)['system_closing_balance'];
            // if ($availableBalance < $transaction->converted_amount) {
            //     return $this->failed('الرصيد غير كافٍ لإتمام المعاملة.');
            // }
            dd($availableBalance);

            $transaction->update([
                'status' => TransactionStatusEnum::COMPLETED->value,
                'closed_by' => auth()->id(),
            ]);

            // $this->transactionService->confirmCashMovement($transaction);

            return $this->success('تم تغيير حالة المعاملة إلى مكتملة.', [
                'transaction' => $transaction->refresh(),
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'TransactionController@completeStatus');

            return $this->failed('حدث خطأ أثناء إكمال المعاملة');
        }
    }

    public function getTransaction(Transaction $transaction)
    {
        try {
            return $this->success('تم تغيير حالة المعاملة إلى مكتملة.', [
                'transaction' => $transaction,
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

    public function update(TransactionRequest $request, Transaction $transaction)
    {
        try {
            $transaction->update($request->validated());

            return $this->success('تم تعديل المعاملة بنجاح.', [
                'transaction' => $transaction->refresh(),
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'TransactionController@cancelStatus');

            return $this->failed('حدث خطأ أثناء تعديل المعاملة');
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

    public function getTransactionData(Transaction $transaction)
    {
        try {
            $transaction->load([
                'fromCurrency',
                'toCurrency',
                'createdBy',
                'closedBy',
                'assignedTo',
            ]);

            return $this->success('تم جلب بيانات المعاملة بنجاح.', [
                'data' => [
                    'id' => $transaction->id,
                    'from_currency_id' => $transaction->from_currency_id,
                    'to_currency_id' => $transaction->to_currency_id,
                    'original_amount' => $transaction->original_amount,
                    'converted_amount' => $transaction->converted_amount,
                    'notes' => $transaction->notes,
                    'status' => $transaction->status,
                    'created_at' => $transaction->created_at,
                    'updated_at' => $transaction->updated_at,
                    'from_currency' => $transaction->fromCurrency,
                    'to_currency' => $transaction->toCurrency,
                    'created_by' => $transaction->createdBy,
                    'closed_by' => $transaction->closedBy,
                    'assigned_to' => $transaction->assignedTo,
                ],
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'TransactionController@getTransactionData');

            return $this->failed('حدث خطأ أثناء جلب بيانات المعاملة');
        }
    }
}
