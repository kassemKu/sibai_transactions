<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return $this->success('Users retrieved successfully.', [
            'users' => User::all(),
        ]);
    }

    public function show(User $user) {}

    public function update(Request $request, User $user) {}

    public function store(Request $request) {}
}
