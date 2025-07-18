<?php

namespace App\Http\Controllers;

use App\Http\Requests\CompanyStoreRequest;
use App\Models\Company;

class CompanyController extends Controller
{
    public function index()
    {
        try {
            $companies = Company::with('transfers')->get();

            return inertia('Companies/Index')->with([
                'companies' => $companies,
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'CompanyController@index');

            return $this->failed('حدث خطأ أثناء جلب الشركات');
        }
    }

    public function store(CompanyStoreRequest $request)
    {
        try {
            $company = Company::create($request->validated());

            return $this->success('تم إنشاء الشركة بنجاح.', [
                'company' => $company,
            ], 201);
        } catch (\Exception $e) {
            $this->errorLog($e, 'CompanyController@store');

            return $this->failed('حدث خطأ أثناء إنشاء الشركة');
        }
    }

    public function edit(Company $company)
    {
        try {
            return inertia('Companies/Show')->with([
                'company' => $company->load([
                    'transfers',
                    'transfers.company',
                    'transfers.currency',
                ]),
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'CompanyController@show');

            return $this->failed('حدث خطأ أثناء جلب بيانات الشركة');
        }
    }

    public function show(Company $company)
    {
        try {
            return inertia('Companies/Show')->with([
                'company' => $company->load([
                    'transfers',
                ]),
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'CompanyController@show');

            return $this->failed('حدث خطأ أثناء جلب بيانات الشركة');
        }
    }

    public function update(CompanyStoreRequest $request, Company $company)
    {
        try {
            $company->update($request->validated());

            return $this->success('تم تحديث الشركة بنجاح.', [
                'company' => $company,
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'CompanyController@update');

            return $this->failed('حدث خطأ أثناء تحديث الشركة');
        }
    }

    public function destroy(Company $company)
    {
        try {
            $company->delete();

            return $this->success('تم حذف الشركة بنجاح.');
        } catch (\Exception $e) {
            $this->errorLog($e, 'CompanyController@destroy');

            return $this->failed('حدث خطأ أثناء حذف الشركة');
        }
    }
}
