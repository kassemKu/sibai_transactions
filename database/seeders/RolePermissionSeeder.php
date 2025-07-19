<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Laratrust\Models\Permission as ModelsPermission;
use Laratrust\Models\Role as ModelsRole;

class RolePermissionSeeder extends Seeder
{
    public function run()
    {
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Truncate pivot tables first
        DB::table('permission_role')->truncate();
        DB::table('role_user')->truncate();
        DB::table('permission_user')->truncate();

        // Truncate main tables
        ModelsPermission::truncate();
        ModelsRole::truncate();

        // Enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Create roles
        $roles = [
            ['name' => 'super_admin', 'display_name' => 'مدير النظام'],
            ['name' => 'admin', 'display_name' => 'مدير'],
            ['name' => 'casher', 'display_name' => 'كاشير'],
        ];
        foreach ($roles as $role) {
            Role::create($role);
        }

        // Create permissions
        // $perms = ['start_session', 'end_session', 'transaction'];
        // foreach ($perms as $p) {
        //     Permission::create(['name' => $p]);
        // }

        // // Assign permissions
        // $super = Role::whereName('super_admin')->first();
        // $admin = Role::whereName('admin')->first();
        // $casher = Role::whereName('casher')->first();

        // $all = Permission::all();
        // $super->givePermissions($all);
        // $admin->givePermissions($all);
        // $casher->givePermissions(
        //     Permission::whereIn('name', ['start_session', 'transaction'])->get()
        // );
    }
}
