<?php

namespace App\Http\Controllers;

use App\Http\Requests\TransferStoreRequest;
use App\Models\Transfer;

class TransferController extends Controller
{
    public function index()
    {
        try {
            $transfers = Transfer::with('company')->get();

            return inertia('Transfers/Index')->with([
                'transfers' => $transfers,
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'TransferController@index');

            return $this->failed('حدث خطأ أثناء جلب الحوالات');
        }
    }

    public function store(TransferStoreRequest $request)
    {
        try {
            $transfer = Transfer::create($request->validated());

            return $this->success('تم إنشاء الحوالة بنجاح.', [
                'transfer' => $transfer,
            ], 201);
        } catch (\Exception $e) {
            $this->errorLog($e, 'TransferController@store');

            return $this->failed('حدث خطأ أثناء إنشاء الحوالة');
        }
    }

    public function edit(Transfer $transfer)
    {
        try {
            return inertia('Transfers/Show')->with([
                'transfer' => $transfer->load('company'),
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'TransferController@show');

            return $this->failed('حدث خطأ أثناء جلب بيانات الحوالة');
        }
    }

    public function update(TransferStoreRequest $request, Transfer $transfer)
    {
        try {
            $transfer->update($request->validated());

            return $this->success('تم تحديث الحوالة بنجاح.', [
                'transfer' => $transfer,
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'TransferController@update');

            return $this->failed('حدث خطأ أثناء تحديث الحوالة');
        }
    }

    public function destroy(Transfer $transfer)
    {
        try {
            $transfer->delete();

            return $this->success('تم حذف الحوالة بنجاح.');
        } catch (\Exception $e) {
            $this->errorLog($e, 'TransferController@destroy');

            return $this->failed('حدث خطأ أثناء حذف الحوالة');
        }
    }
}
