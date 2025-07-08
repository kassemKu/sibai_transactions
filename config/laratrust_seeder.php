<?php

return [
    /**
     * Control if the seeder should create a user per role while seeding the data.
     */
    'create_users' => false,

    /**
     * Control if all the laratrust tables should be truncated before running the seeder.
     */
    'truncate_tables' => true,

    'roles_structure' => [
        'superadministrator' => [
            'users' => 'c,r,u,d',
            'payments' => 'c,r,u,d',
            'cache' => 'c,r,u,d',
            'cache_locks' => 'c,r,u,d',
            'jobs' => 'c,r,u,d',
            'two_factor_secret' => 'c,r,u,d',
            'roles' => 'c,r,u,d',
            'permissions' => 'c,r,u,d',
            'personal_access_tokens' => 'c,r,u,d',
            'customers' => 'c,r,u,d',
            'currencies' => 'c,r,u,d',
            'cash_sessions' => 'c,r,u,d',
            'transactions' => 'c,r,u,d',
            'cash_movements' => 'c,r,u,d',
            'cash_sessions' => 'c,r,u,d',
            'cash_balances' => 'c,r,u,d',
            'cash_sessions' => 'c,r,u,d',
            'profile' => 'r,u',
        ],
        'administrator' => [
            'users' => 'c,r,u,d',
            'payments' => 'c,r,u,d',
            'profile' => 'r,u',
            'users' => 'c,r,u,d',
            'payments' => 'c,r,u,d',
            'cache' => 'c,r,u,d',
            'cache_locks' => 'c,r,u,d',
            'jobs' => 'c,r,u,d',
            'two_factor_secret' => 'c,r,u,d',
            'roles' => 'c,r,u,d',
            'permissions' => 'c,r,u,d',
            'personal_access_tokens' => 'c,r,u,d',
            'customers' => 'c,r,u,d',
            'currencies' => 'c,r,u,d',
            'cash_sessions' => 'c,r,u,d',
            'transactions' => 'c,r,u,d',
            'cash_movements' => 'c,r,u,d',
            'cash_sessions' => 'c,r,u,d',
            'profile' => 'r,u',
        ],
        'super_admin' => [
            'users' => 'c,r,u,d',
            'payments' => 'c,r,u,d',
            'cache' => 'c,r,u,d',
            'cache_locks' => 'c,r,u,d',
            'jobs' => 'c,r,u,d',
            'two_factor_secret' => 'c,r,u,d',
            'roles' => 'c,r,u,d',
            'permissions' => 'c,r,u,d',
            'personal_access_tokens' => 'c,r,u,d',
            'customers' => 'c,r,u,d',
            'currencies' => 'c,r,u,d',
            'transactions' => 'c,r,u,d',
            'cash_sessions' => 'c,r,u,d',
            'cash_balances' => 'c,r,u,d',
            'cash_sessions' => 'c,r,u,d',
            'profile' => 'r,u',
        ],
        'admin' => [
            'users' => 'c,r,u,d',
            'payments' => 'c,r,u,d',
            'cache' => 'c,r,u,d',
            'cache_locks' => 'c,r,u,d',
            'jobs' => 'c,r,u,d',
            'two_factor_secret' => 'c,r,u,d',
            'roles' => 'c,r,u,d',
            'permissions' => 'c,r,u,d',
            'personal_access_tokens' => 'c,r,u,d',
            'customers' => 'c,r,u,d',
            'profile' => 'r,u',
        ],
        'casher' => [
            'users' => 'c,r,u,d',
            'profile' => 'r,u',
        ],
        'user' => [
            'profile' => 'r,u',
        ]
    ],

    'permissions_map' => [
        'c' => 'create',
        'r' => 'read',
        'u' => 'update',
        'd' => 'delete',
    ],
];
