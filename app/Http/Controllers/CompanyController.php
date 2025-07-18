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

    public function show(Company $company)
    {
        try {
            $company->load([]); // eager load nothing extra for company itself
            $transfers = $company->transfers()->with(['company', 'currency'])->paginate(10);

            // // Calculate totals
            // $total_incoming = $company->transfers()->where('type', 'in')->sum('amount');
            // $total_outgoing = $company->transfers()->where('type', 'out')->sum('amount');

            // // Determine admin position
            // if ($total_outgoing > $total_incoming) {
            //     $admin_position = 'debtor'; // Admin owes the company
            // } elseif ($total_incoming > $total_outgoing) {
            //     $admin_position = 'creditor'; // Company owes the admin
            // } else {
            //     $admin_position = 'neutral';
            // }

            // Calculate per-currency balances
            $currency_balances = $company->transfers()
                ->selectRaw('currency_id, SUM(CASE WHEN type = "in" THEN amount ELSE 0 END) as total_incoming, SUM(CASE WHEN type = "out" THEN amount ELSE 0 END) as total_outgoing')
                ->groupBy('currency_id')
                ->with('currency')
                ->get()
                ->map(function ($row) {
                    $net = $row->total_incoming - $row->total_outgoing;
                    return [
                        'currency' => $row->currency,
                        'total_incoming' => (float) $row->total_incoming,
                        'total_outgoing' => (float) $row->total_outgoing,
                        'net' => (float) $net,
                    ];
                });

            // Placeholder for future unified global total using exchange rates
            // Example: You could fetch exchange rates and convert all per-currency net values to a base currency (e.g., USD) here
            // $exchangeRates = [ 'SYP' => 0.0004, 'USD' => 1, ... ];
            // $global_net_usd = 0;
            // foreach ($currency_balances as $cb) {
            //     $code = $cb['currency']['code'];
            //     $rate = $exchangeRates[$code] ?? 1;
            //     $global_net_usd += $cb['net'] * $rate;
            // }
            // Do not return $global_net_usd yet; just a placeholder for future use.

            return inertia('Companies/Show')->with([
                'company' => $company,
                'transfers' => $transfers,
                // 'total_incoming' => $total_incoming,
                // 'total_outgoing' => $total_outgoing,
                // 'admin_position' => $admin_position,
                'currency_balances' => $currency_balances,
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
