<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserStoreRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        try {
            $users = User::with('roles')->get();

            return inertia('Users/Index')->with([
                'users' => $users,
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'UserController@index');

            return $this->failed('حدث خطأ أثناء جلب المستخدمين');
        }
    }

    public function getUsers()
    {
        try {
            $users = User::with('roles')->get();

            return $this->success('تم جلب المستخدمين بنجاح.', [
                'users' => $users,
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'UserController@getUsers');

            return $this->failed('حدث خطأ أثناء جلب المستخدمين');
        }
    }

    public function show(User $user)
    {
        try {
            return inertia('Users/Show')->with([
                'user' => $user->load('roles'),
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'UserController@show');

            return $this->failed('حدث خطأ أثناء جلب بيانات المستخدم');
        }
    }

    public function store(UserStoreRequest $request)
    {
        try {
            $data = $request->validated();
            $roleId = $data['role_id'];
            unset($data['role_id']);
            if (isset($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            }
            $user = User::create($data);
            $user->roles()->sync([$roleId]);

            return $this->success('تم إنشاء المستخدم بنجاح.', [
                'user' => $user->load('roles'),
            ], 201);
        } catch (\Exception $e) {
            $this->errorLog($e, 'UserController@store');

            return $this->failed('حدث خطأ أثناء إنشاء المستخدم');
        }
    }

    public function update(UserStoreRequest $request, User $user)
    {
        try {
            $data = $request->validated();
            $roleId = $data['role_id'];
            unset($data['role_id']);
            if (isset($data['password']) && $data['password']) {
                $data['password'] = Hash::make($data['password']);
            } else {
                unset($data['password']);
            }
            $user->update($data);
            $user->roles()->sync([$roleId]);

            return $this->success('تم تحديث بيانات المستخدم بنجاح.', [
                'user' => $user->load('roles'),
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'UserController@update');

            return $this->failed('حدث خطأ أثناء تحديث بيانات المستخدم');
        }
    }

    public function getRoles()
    {
        try {
            $roles = Role::all();

            return $this->success('تم جلب الأدوار بنجاح.', [
                'roles' => $roles,
            ]);
        } catch (\Exception $e) {
            $this->errorLog($e, 'UserController@roles');

            return $this->failed('حدث خطأ أثناء جلب الأدوار');
        }
    }
}
