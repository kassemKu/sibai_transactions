<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return $this->success('Currencies retrieved successfully.', [
            'currencies' => User::all(),
        ]);
    }

    public function show(User $currency) {}

    public function update(Request $request, User $currency) {}

    public function store(Request $request) {}
}
